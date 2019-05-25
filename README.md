# FFParser
> Parse input stream by frames directly into your code as a buffer.

> LIMITATION: this library doesn't work with mp4 video format, due to the fact that mp4 video is not frame-by-frame output to stdout.

## Install
```bash
npm i ffparser
```
![npm](https://img.shields.io/npm/v/ffparser.svg)
![NPM](https://img.shields.io/npm/l/ffparser.svg)

## Example
```js
const FFParser = require('ffparser');
const fs = require("fs");

new FFParser('rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov')
    .setFrameRate('1/1')
    .setQuality(2)
    .setFrameHandler((frame) => fs.writeFile('image.jpeg', frame, () => {}))
    .run();
```

This simple command will parse the provided stream at a frame rate of ~ 1 fps and with the highest quality. The resulting frames are saved in a file. <br>
You can try this example in the test directory.

## Docs
**FFParser(inputPath: string, customArgs?: string[])**<br>
`inputPath` (_required_) - URL or path to input video stream
`customArgs` (_optional_) - Custom ffmpeg params. Will override the existing ones.

**setFrameRate(frameRate: string): FFParser** - setup the output frame rate. **NOTE: this works approximately!** <br>
`frameRate` (_required_) - in format '1/2' means 1 frame per 2 seconds. Defaulr value is 1/1. You cannot specify more than the value of the stream itself

**setQuality(quality: number): FFParser** - defines the quality of the output JPEG image.<br>
`quality` (_required_) - available range from 1 to 31, where a lower value means better quality. Default value is 2

**enableLogs(): FFParser** - show ffmpeg logs in console

**setFrameHandler(fn: FrameHandlerFn): FFParser** - setup a callback function which will produce new frames.<br>
`fn = (frame: Buffer, info?: FrameInformation) => void`<br>
`frame` - new frame as a buffer <br>
`info` - frame information

```js
FrameInformation {
    frameNumber: string; // frame number from the beginning of parsing
    fps: string;
    quality: string;
    time: string; // time from the beginning of parsing
}
```

**run(): void** - start parsing

## How to build
```bash
npm run tsc
```
Will create a build directory with the compiled lib, and test.
