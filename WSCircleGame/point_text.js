/**
 * draws the text that tells how many point you earns. the text flies towards the score board in a curved path.
 */
class PointText {

    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.elapsed = 0;
        this.duration = 1;
        this.yTween = new Tween(y, 0, this.duration);
        this.xTween = new Tween(x, _DotGameGlobal.canvasBoundingRect.width / 2, this.duration);
        this.opacityTween = new Tween(1, 0, this.duration);
    }

    render(){
        const { ctx, time } = _DotGameGlobal;
        this.elapsed += time.deltaTime;
        if(this.elapsed > this.duration) {
            _DotGameGlobal.scene.delete(this);
            return;
        }
        ctx.save();
        ctx.font = 'bold 30px arial';
        ctx.globalAlpha = this.opacityTween.linear(time.deltaTime);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.xTween.easeOut(time.deltaTime), this.yTween.linear(time.deltaTime));
        ctx.restore();
    }

}