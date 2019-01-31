#!/usr/bin/python3
import sys

#File format:
#   header [compressedArraySizeLSB,compressedArraySizeMSB]
#   header [outputArraySizeLSB,outputArraySizeMSB]
#   Eh.. see returnLZCodes function notes for more details.
#

MAXCODELEN = 126
 
def readFile(file):
        a = []
        f = open(file,'rb')
        b = f.read(1)
        while b!=b'':
                a.append(ord(b))
                b = f.read(1)
        f.close()
        return a
 
def writeFile(file,a):
        f = open(file,'wb+')
        f.write(bytes(a))
        f.close()
 
#winsize: default -1 for SoF, else curpos-winsize bounded by SoF.
def resetSlidingWindow(curpos,winsize=None):
        if winsize is None:
            a=0
        else:
            if winsize>curpos:
                a=0
            else:
                a=curpos-winsize
        return a

#decomp v0.2
#[0zzz zzzz] = (z+1) size of following literal bytes
#[1zzz zzzz,xxxx xxxx] = (z+2) size of bytes at x bytes backref
#
def returnLZCodes(count,backrefptr,symbol):
        a = []
        if isinstance(symbol,list):
            b = symbol
        else:
            b = [symbol]
        if backrefptr == 0:
            a = [count&0x7F] + b
        else:
            a = [count|0x80,backrefptr] # + b
        return a
        

        
        
        
# do not allow "compression" of files less than 2 bytes long        
def compress(inArray):
    global MAXCODELEN
    lbhptr = 0    #filestart
    cptr = 1      #filestart+1
    matchfound = 0  #flag1
    foundcount = 0
    foundbackref = 0
    outArray = []
    literalbuf = [inArray[0]]
    EoA = len(inArray)  #not +1, cuz we need var at EoF to emit as literal
    while cptr < EoA:
        if inArray[lbhptr] == inArray[cptr]:
            csrchptr = cptr
            clbhptr = lbhptr
            rlecount = 0
            mcount = 0
            while inArray[clbhptr] == inArray[csrchptr]:
                if (csrchptr+1)==(EoA-1): #do not allow final tok to be consumed
                    break
                if mcount >= MAXCODELEN:
                    break
                if clbhptr==cptr:
                    clbhptr = lbhptr
                    rlecount += 1
                mcount += 1
                clbhptr += 1
                csrchptr += 1
            if (mcount > foundcount) and (mcount > 3):  #replace 3 later with codelen
                matchfound = 1
                foundcount = mcount
                foundbackref = cptr-lbhptr
                foundposend = csrchptr
        lbhptr += 1
        
        if lbhptr >= cptr:
            if matchfound == 1:
                if len(literalbuf) > 0:
                   # if len(literalbuf) > 255:
                   #     print("Error literalbuffer overrun!", str(literalbuf))
                    outArray.extend(returnLZCodes(len(literalbuf)-1,0,literalbuf))
                    del literalbuf[:]
                outArray.extend(returnLZCodes(foundcount-2,foundbackref,inArray[foundposend]))
               # print("Match found: count " + str(foundcount) + ", backref " + str(foundbackref) + ", position " + str(cptr) + ", trailing num " + str(inArray[cptr+foundcount]) + " sanity check match " + str(inArray[foundposend]))
                cptr = foundposend-1  #to compensate for lookahead literal write, also if last symbol, next check falls through and exits out while loop normally
                matchfound = 0
                foundcount = 0
                foundbackref = 0
            else:
                literalbuf.append(inArray[cptr])
                if len(literalbuf) >= MAXCODELEN:  #flush buffer if reached max code size
                    outArray.extend(returnLZCodes(len(literalbuf)-1,0,literalbuf))
                    del literalbuf[:]
                    print("literalbuf filled, forcing buffer flush.")
            cptr += 1
            lbhptr = resetSlidingWindow(cptr,255)
            if cptr == (EoA-1):
                literalbuf.append(inArray[cptr])
                break  #break out of the while loop and force a buffer flush
    if len(literalbuf) > 0:
        outArray.extend(returnLZCodes(len(literalbuf)-1,0,literalbuf))
    #later on, return 2D array, [[outArray],[listOfCompressionDetails]]
    return outArray

#Ver 0.1: fixed len [size,backref,symbol(s)]
# If size=0, omit backref, use symbol.
# If backref=0, size+1= number of symbols (including trailing symbol)
#
def decompress(inArray):
    pass  #begin routine
    outArray = []
    cptr = 0
    while cptr < len(inArray):
        tempc = inArray[cptr]
        if (tempc&0x80)==0:
            count = (tempc&0x7F)+1
            cptr += 1
            for x in range(count):
                outArray.append(inArray[cptr])
                cptr += 1
        else:
            count = (tempc&(0x7F)) + 2
            backref = inArray[cptr+1]
            startptr = len(outArray)-backref
            for x in range(count):
                outArray.append(outArray[startptr+x])
          #  outArray.append(inArray[cptr+2])
            cptr += 2
    pass #end main loop
    return outArray

# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# Program start

if (len(sys.argv) < 2) or (sys.argv[1][0]=='-') or (sys.argv[1][0]=='/'):
    print("Usage: cmprss.ph <infile> <outfile> <options>")
    print("For help: cmprss.ph -h")
    sys.exit(1)
if "-h" in sys.argv:
    print("Usage: cmprss.ph <infile> <outfile> <options>")
    print("Options:")
    print("-t : Test mode (do not output to file)")
    print("-a : Add size header to file")
inFileName = sys.argv[1]
if (len(sys.argv) > 2) and (sys.argv[2][0]!='-'):
    outFileName = sys.argv[2]
else:
    outFileName = ""
if "-a" in sys.argv:
    addHeader = 1
else:
    addHeader = 0
if "-t" in sys.argv:
    testMode = 1
else:
    testMode = 0
    



inFileArray = readFile(inFileName)  #later read from cmdline
dataFreq = [0 for i in range(256)]  #table of num of occurances of bytes
#check 
count = 0
while count < len(inFileArray):
    dataFreq[inFileArray[count]] += 1
    count += 1

item_freq = 65535
item_code = 0
count = 0
filesum = 0

while count < 256:
    if dataFreq[count]<item_freq:
        item_freq = dataFreq[count]
        item_code = count
    filesum += dataFreq[count]
    count += 1
    
sixteensum = 0
for x in range(len(inFileArray)):
    sixteensum += inFileArray[x]
sixteensum = sixteensum & 0x00FFFF

print("Sanity check: fSize: " + str(len(inFileArray)) +
      ", summation " + str(filesum) + ", 16-bit chksum " + str(sixteensum))
#print("Item chosen: " + str(item_code) + " with " +
#      str(item_freq) + " occurrances.")

#escapecode = item_code
#escapelength = 0
#tmpvar = escapecode
#while 1:
#    escapelength += 1
#    tmpvar //= 2
#    if tmpvar == 0:
#        break
      
# print("Escape code chosen: " + str(escapecode) +
#      ", bit length: " + str(escapelength))

resultArray = compress(inFileArray)

print("Result array length :" + str(len(resultArray)))

for x in range(0,len(resultArray)):
    if resultArray[x]>255:
        print("Error: Array item " + str(x) + " outside bounds (" + str(resultArray[x]) + ")")
        print("Around: " + str(resultArray[x-4:x+4]))
#writeFile("testoutput",resultArray)

print("Decompression test start.")
decompTest = decompress(resultArray)
print("Length comparison: original: " + str(len(inFileArray)) + ", decompressed: " + str(len(decompTest)))

if str(len(inFileArray)) == str(len(decompTest)):
    print("Data integrity test")
    errcode = 0
    for x in range(len(resultArray)):
        if inFileArray[x] != decompTest[x]:
            errcode = 1
            print("Data mismatch at position " + str(x) + ": " + str(inFileArray[x]) + " vs " + str(decompTest[x]))
    if errcode == 0:
        print("Test successful. No discrepencies detected.")
    else:
        print("Error: Data mismatch found. File not written.")
        print("In: " + str(inFileArray[0:10]) + "\nOut: " + str(resultArray[0:10]) + "\nChk: " + str(decompTest))
        sys.exit(2)
else:
    print("Error: Test length mismatch. File not written.")
    print("In: " + str(inFileArray[0:10]) + "\nOut: " + str(resultArray[0:10]) + "\nChk: " + str(decompTest[0:10]))
    sys.exit(2)
#
sizeLSB = len(resultArray)%256
sizeMSB = (len(resultArray)//256)%256
resultArray = [sizeLSB,sizeMSB] + resultArray

sizeLSB = len(inFileArray)%256
sizeMSB = (len(inFileArray)//256)%256
resultArray = [sizeLSB,sizeMSB] + resultArray

if addHeader == 1:
    print("Debug: resarraysample: " + str(resultArray[0:10]))

if testMode == 0:
    writeFile(outFileName,resultArray)
    print("File [" + outFileName + "] was output.")
else:
    print("Test mode running. No output.")
inSize = len(inFileArray)
outSize = len(resultArray)
print("Success! In: " + str(inSize) + ", Out: " + str(outSize) + " (" + str((((outSize/inSize)*100)//1)) + "% of original)")
