#!/bin/bash
ffmpeg -video_size 800x600 -framerate 30 -f x11grab -i :0.0+13,85 -vcodec libx264 -preset ultrafast -crf 21 -threads 0 "$1"
