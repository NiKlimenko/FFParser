import {ChildProcessWithoutNullStreams, spawn} from "child_process";

export interface FrameInformation {
    frameNumber: string;
    fps: string;
    quality: string;
    time: string;
}

export type FrameHandlerFn = (frame: Buffer, info?: FrameInformation) => void

export class FFParser {
    frameRate = '';
    quality = 2;
    showLogs = false;

    private newFrameHandler: FrameHandlerFn|undefined;

    private ffmpegProcess: ChildProcessWithoutNullStreams|undefined;
    private frameBuffer = Buffer.from('');

    constructor(public inputPath: string, public customArgs?: string[]) {}

    setFrameRate(frameRate: string): FFParser {
        this.frameRate = frameRate;
        return this;
    }

    setQuality(quality: number): FFParser {
        this.quality = quality;
        return this;
    }

    enableLogs(): FFParser {
        this.showLogs = true;
        return this;
    }

    setFrameHandler(fn: FrameHandlerFn): FFParser {
        this.newFrameHandler = fn;
        return this;
    }

    run() {
        const args = this.customArgs || this.buildArgs();
        this.ffmpegProcess = spawn('ffmpeg', args);

        this.ffmpegProcess.stdout.on('data', this.onFrameBinaryChunkReceived.bind(this));
        this.ffmpegProcess.stderr.on('data', this.onFrameParseInformationReceived.bind(this));
    }

    private buildArgs(): string[] {
        const args = [
            '-i', this.inputPath,
            '-f', 'image2pipe',
            '-q:v', this.quality.toString()
        ];

        if (this.frameRate) {
            args.push('-r', this.frameRate);
        }

        args.push('pipe:1');

        return args
    }

    private onFrameBinaryChunkReceived(frameChunk: Uint8Array) {
        const chunk = Buffer.from(frameChunk);
        this.frameBuffer = Buffer.concat([this.frameBuffer, chunk]);
    }

    private onFrameParseInformationReceived(info: Uint8Array) {
        const message = info.toString();
        if (this.showLogs) {
            console.log(message);
        }

        const messageWithoutSpaces = message.replace(/ /g,'');
        const frameInformation = this.parseInformation(messageWithoutSpaces);

        if (frameInformation && this.frameBuffer.length !== 0) {
            const {groups} = frameInformation;
            let info: FrameInformation|undefined;
            if (groups) {
                info = {
                    frameNumber: groups.frame,
                    fps: groups.fps,
                    quality: groups.quality,
                    time: groups.time
                };
            }

            if (this.newFrameHandler) {
                this.newFrameHandler(this.frameBuffer, info);
            }

            this.frameBuffer = Buffer.from('');
        }
    }

    private parseInformation(message: string): RegExpExecArray|null {
        const regexp = /frame=(?<frame>\d*)fps=(?<fps>[\d.]*)q=(?<quality>[\d.]*).*time=(?<time>[\d:\.]*)/gi;
        return regexp.exec(message);
    }
}
