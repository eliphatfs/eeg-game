import SerialPort from "serialport";

export interface TGAMEventDataTypeMapper {
    poorSignal: number
    attention: number
    meditation: number
    blink: number
    wave: number
    spectrum: number[]
}

export type TGAMEventMapper = {
    [k in keyof TGAMEventDataTypeMapper]: ((data: TGAMEventDataTypeMapper[k]) => void)
}

export type TGAMEventHandlers = {
    [k in keyof TGAMEventMapper]: TGAMEventMapper[k][]
}

class TGAM {
    port: SerialPort
    queue: number[]
    handlers: TGAMEventHandlers
    constructor(portName: string) {
        this.port = new SerialPort(portName, { baudRate: 57600 });
        this.queue = [];
        this.port.on(
            'readable', () =>
            this.queue.push(...Array.from(new Uint8Array(this.port.read() as Buffer)))
        );
        setInterval(() => this.tick(), 50);
        this.handlers = {
            poorSignal: [], attention: [], meditation: [],
            blink: [], wave: [], spectrum: []
        };
    }

    tick() {
        let oldLength = 0;
        do {
            oldLength = this.queue.length;
            this.sync();
        } while (oldLength != this.queue.length);
        while (this.sync())
            this.packet();
    }

    sync(): boolean {
        if (this.queue.length >= 2) {
            if (this.queue[0] != 0xAA) {
                this.queue.shift();
                return false;
            }
            if (this.queue[1] != 0xAA) {
                this.queue.shift();
                return false;
            }
        }
        if (this.queue.length >= 3) {
            return this.queue.length >= 4 + this.queue[2];
        }
        return false;
    }

    on<T extends keyof TGAMEventDataTypeMapper>(ev: T, handler: TGAMEventMapper[T]) {
        this.handlers[ev].push(handler as any);
        return this;
    }

    fire<T extends keyof TGAMEventDataTypeMapper>(ev: T, data: TGAMEventDataTypeMapper[T]) {
        this.handlers[ev].forEach((fn) => fn(data as any));
    }

    match(b: number) {
        const popped = this.queue.shift();
        if (popped != b)
            throw new Error(`Malformed data stream: expected ${b}, got ${popped}`);
    }

    packet() {
        const thiz = this;
        function _sync() { thiz.match(0xAA); }
        function _dataRow(): number {
            const code = thiz.queue.shift();
            switch (code) {
                case 0x02:
                    thiz.fire('poorSignal', thiz.queue.shift()!);
                    return 2;
                case 0x04:
                    thiz.fire('attention', thiz.queue.shift()!);
                    return 2;
                case 0x05:
                    thiz.fire('meditation', thiz.queue.shift()!);
                    return 2;
                case 0x16:
                    thiz.fire('blink', thiz.queue.shift()!);
                    return 2;
                case 0x80:
                    thiz.match(2);
                    const raw = ((thiz.queue.shift()! * 256) + thiz.queue.shift()!);
                    thiz.fire('wave', (raw < 32768 ? raw : raw - 65536) / 32768);
                    return 4;
                case 0x83:
                    thiz.match(24);
                    let bands = [];
                    for (let i = 0; i < 8; i++) {
                        let spectra = 0;
                        for (let s = 16; s >= 0; s -= 8) {
                            spectra += thiz.queue.shift()! << s;
                        }
                        bands.push(spectra);
                    }
                    thiz.fire('spectrum', bands);
                    return 26;
                default:
                    throw new Error(`Malformed data stream: unexpected data code ${code}`);
            }
        }

        while (this.queue[0] == 0xAA) _sync();
        let payloadSize = this.queue.shift()!;
        let pointer = 0;
        while (pointer < payloadSize) pointer += _dataRow();
        this.queue.shift();
    }
}

export default TGAM;
