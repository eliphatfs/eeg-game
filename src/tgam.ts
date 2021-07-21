import SerialPort from "serialport";

class TGAM {
    port: SerialPort
    queue: number[]
    constructor(portName: string) {
        this.port = new SerialPort(portName);
        this.queue = [];
        this.port.on(
            'data',
            (incoming: number[]) => this.queue.push(...incoming)
        );
        setInterval(() => this.tick(), 30);
    }

    tick() {
        while (this.queue.length > 0)
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

    packet() {

    }
}

export default TGAM;
