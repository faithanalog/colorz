var lwip  = require('lwip');
var _     = require('lodash');
var fs    = require('fs');

var xLibPalette = new Array(256);
for (var i = 0; i < xLibPalette.length; i++) {
    var rgb16 = (i << 8) | i;
    var r = ((rgb16 >> 11) & 0x1F) * 0xFF / 0x1F;
    var g = ((rgb16 >> 5)  & 0x3F) * 0xFF / 0x3F;
    var b = ( rgb16        & 0x1F) * 0xFF / 0x1F;
    xLibPalette[i] = new Uint8Array([r, g, b]);
}

var rgb24ToXLib = _.memoize(function(r, g, b) {
    return _(xLibPalette)
        .map(function(p, i) {
            var dr = p[0] - r;
            var dg = p[1] - g;
            var db = p[2] - b;
            return [dr * dr + dg * dg + db * db, i];
        })
        .sortBy(0)
        .first()[1];
}, function(r, g, b) { 
    return (r << 16 | g << 8 | b);
});

function rle(valMap, bytes) {
    if (bytes.length === 0)
        return [];
    var x = _.first(bytes);
    function eq(v) {
        return v === x;
    }
    var l = _.takeWhile(bytes, eq);
    var r = _.dropWhile(bytes, eq);

    while (l.length > 63) {
        r = _.drop(l, 63).concat(r);
        l = _.take(l, 63);
    }
    
    var out;
    if (l.length > 3) {
        out = [63, l.length, valMap(x)];
    } else {
        out = _.map(l, valMap);
    }
    return out.concat(rle(valMap, r));
}

function makeTransformer() {
    var mapping = [];
    function convert(x) {
        var i = mapping.indexOf(x);
        if (i === -1) {
            i = mapping.length;
            mapping.push(x);
        }
        return i;
    }
    return [mapping, convert];
}

function bitpack(bytes) {
    var l, r = bytes;

    var out = [];
    while (r.length > 0) {
        l = _.take(r, 4);
        r = _.drop(r, 4);

        var x = (l[0] << 18) | (l[1] << 12) | (l[2] << 6) | l[3];
        out = out.concat([
            (x >> 16) & 0xFF,
            (x >> 8) & 0xFF,
            x & 0xFF
        ]);
    }
    return out;
}

lwip.open('world.png', function(err, img) {
    if (err)
        throw err;
    
    var width  = 128;
    var height = 63;
    var pixels = new Array(width * height);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var p = img.getPixel(x, y);
            pixels[x + y * width] = rgb24ToXLib(p.r, p.g, p.b);
        }
    }
    fs.writeFile('world.json', JSON.stringify(pixels));
    fs.writeFile('world.bin',  new Buffer(pixels));

    var trans   = makeTransformer();
    var mapping = trans[0];
    var valMap  = trans[1];
    var packed  = bitpack(rle(valMap, pixels));
    fs.writeFile('world.bin.rle', new Buffer(packed));
});
