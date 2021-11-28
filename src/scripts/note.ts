export default class Note {
    time: Number;
    buttonId: Number;
    
    constructor(time: Number, buttonId: Number) {
        this.time = time;
        this.buttonId = buttonId;
    }

    toBytes() {
        const floatBuffer = new ArrayBuffer(8);
        const floatView = new Float64Array(floatBuffer);
        floatView[0] = this.time as number;
        const intBuffer = new ArrayBuffer(4);
        const intView = new Int32Array(intBuffer);
        intView[0] = this.buttonId as number;
        
        return [...Array.from(new Uint8Array(floatBuffer)), 
            ...Array.from(new Uint8Array(intBuffer))];
    }
}