/** used to animate a spritesheet */
class Sprite {

    /**
     * renders a sprite sheet
     * @param image image of the sprite sheet
     * @param rows how many rows are there
     * @param cols how many columns
     * @param size the size of final rendered object
     * @param duration how long the animation plays, in seconds
     * @param x where to draw the sprite
     * @param y where to draw the sprite
     */
    constructor(image, rows, cols, size, duration, x, y){
        this.image = image;
        this.cols = cols;
        this.size = size;
        this.duration = duration;
        this.elapsed = 0;
        this.timePerFrame = duration / (rows * cols);
        this.frameWidth = image.width / cols;
        this.frameHeight = image.height / rows;
        this.x = x - size / 2;
        this.y = y - size / 2;
    }

    render() {
        const deltaTime = _DotGameGlobal.time.deltaTime;
        const pos = this.getFrameSourcePosition(deltaTime);
        if(pos) {
            const {sx, sy, sw, sh} = pos;
            _DotGameGlobal.ctx.drawImage(this.image, sx, sy, sw, sh, this.x, this.y, this.size, this.size);
        } else {
            _DotGameGlobal.scene.delete(this);
        }
    }

    getFrameSourcePosition(deltaTime) {
        this.elapsed += deltaTime;
        //no more frames to render.
        if(this.elapsed >= this.duration) return null;
        //which frame we need to render? 0 being the first frame
        const index = this.elapsed / this.timePerFrame;
        const rowIdx = Math.floor(index / this.cols);
        const colIdx = Math.floor(index % this.cols);
        //please refer to https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        //to find out what sx, sy, sw, and sh mean..
        return {
            sx: colIdx * this.frameWidth,
            sy: rowIdx * this.frameHeight,
            sw: this.frameWidth,
            sh: this.frameHeight
        }
    }

}

function getColorfulExplosion(x, y){
    return new Sprite(_DotGameGlobal.imageAsset.get('colorful_star'), 8, 8, 100, 1, x, y);
}

function getPinkStarExplosion(x, y) {
    return new Sprite(_DotGameGlobal.imageAsset.get('pink_star'), 5, 8, 100, 1, x, y);
}

function getYellowStarExplosion(x, y) {
    return new Sprite(_DotGameGlobal.imageAsset.get('yellow_star'), 5, 8, 100, 1, x, y);
}