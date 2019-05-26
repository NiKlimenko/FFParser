import {writeFile} from 'fs';

const FFParser = require('../src');

new FFParser('rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov')
    .setFrameRate('1/1')
    .setQuality(2)
    .setFrameHandler((frame: Buffer) => writeFile('image.jpeg', frame, () => {}))
    .run();
