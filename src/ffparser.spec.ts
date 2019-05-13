import {FFParser} from './ffparser'
import {writeFile} from 'fs';

new FFParser('rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov')
    .setFrameRate('1/1')
    .setQuality(2)
    .setFrameHandler((frame) => writeFile('image.jpeg', frame, () => {}))
    .run();
