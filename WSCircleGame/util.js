class Tween {

    constructor(start, end, duration){
        this.start = start;
        this.delta = end - start;
        this.elapsed = 0;
        this.duration = duration;
    }

    linear (deltaTime) {
        this.elapsed += deltaTime;
        return this.start + this.elapsed / this.duration * this.delta;
    }

    //formula referenced from http://gizma.com/easing/#cub2
    easeOut (deltaTime) {
        this.elapsed += deltaTime;
        const t = this.elapsed / this.duration - 1;
        return this.delta * ( t * t * t + 1 ) + this.start;
    };

}

class Debug {

    static drawCircle(radius) {
        const { ctx } = _DotGameGlobal;
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    static drawFrameRate() {
        const { ctx } = _DotGameGlobal;
        ctx.save();
        ctx.font = '30px arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`frame rate: ${Math.floor(1 /_DotGameGlobal.time.deltaTime)}`, 50, 100);
        ctx.restore();
    }

}