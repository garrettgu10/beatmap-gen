const HIT_CIRCLE = 1;
const SLIDER = 128;
const NOTE_Y = 192;
const DEFAULT_HIT_SOUND = 0;
const COLUMN_COUNT = 4;
const HIT_SAMPLE = "0:0:0:0:"

export default class Note {
    time: number;
    buttonId: number;
    hidden: boolean = false;
    
    constructor(time: number, buttonId: number) {
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

    //Used for osu!mania files
    toString() {
        var str: string;
        str = "" + (this.buttonId * 512 / COLUMN_COUNT) + "," + NOTE_Y + "," + (Math.floor(this.time * 1000)) + "," + HIT_CIRCLE + "," + DEFAULT_HIT_SOUND + ",";
        // if(this.objectParams != 0)
        // {
        //   str += this.objectParams + ":";
        // }
        str += HIT_SAMPLE + "\n";
        return str;
    }
}