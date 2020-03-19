/**
 * this class draws a circle. In our game, a circle is represented by a disney character.
 * it also handles click event on the circle. When player hit a circle, the player gets points
 * and the circle will disappear. When a circle is hit, the game will generate a new circle in
 * 1 second.
 */
class Circle {

    constructor() {
        this.type = this.getCircleType();
        this.radius = this.type.radius || Math.floor(Math.random() * 20) + 15;
        this.x = this.getInitialXCoordinate();
        this.y = 0;
        this.rotateDirection = this.getRotationDirection();
        this.angle = 0;
    }

    /**
     * draws the circle on the canvas
     */
    render(){
        const { time, ctx, speed, scene } = _DotGameGlobal;
        this.y += speed.fallSpeed * time.deltaTime;
        if(this.isOutOfView()) {
            scene.delete(this);
            return;
        }
        this.angle += speed.rotationSpeed * time.deltaTime * this.rotateDirection;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const imageRadius = this.radius * 1.5;
        const imageDiameter = 2 * imageRadius;
        ctx.drawImage(this.type.image, -imageRadius, -imageRadius, imageDiameter, imageDiameter);
        if(_DotGameGlobal.isDebugMode) Debug.drawCircle(this.radius);
        ctx.restore();
    }

    /**
     * is the circle out of the view? if it is already out of view, we can remove this entity from scene and allow it
     * be garbage collected.
     * @returns {boolean}
     */
    isOutOfView() {
        return this.y > _DotGameGlobal.canvasBoundingRect.height;
    }

    /**
     * checks if the coordinate is close enough to the center of the circle. If the distance between the coordinate and
     * the center of the circle is smaller than radius, return true. However, if the radius is too small ( less than 20px),
     * we regard it as 20 px during the test.
     * @param coord
     * @returns {boolean}
     */
    isCoordInRange(coord) {
        const distance =  Math.pow(coord.x - this.x, 2) + Math.pow(coord.y - this.y, 2);
        return distance < Math.pow(Math.max(this.radius, 20), 2);
    }

    /**
     * what happens, after the circle is hit by player.
     */
    onClick(){
        const { scene } = _DotGameGlobal;
        scene.delete(this); //delete the circle from scene
        setTimeout(Circle.spawnNew, Math.random() * 2000);
        //adds points to player's total point
        const pointsAdded = Math.floor(500 / this.radius);
        _DotGameGlobal.totalPoints += pointsAdded;
        _DotGameGlobal.renderTotalPoints();
        //creates a piece of text that represents the points we gain
        scene.add(new PointText(this.x, this.y, pointsAdded, this.type.mainColor));
        const explosion = this.type.explosionCreator(this.x, this.y);
        scene.add(explosion);
    }

    /**
     * gets a random circle type
     */
    getCircleType(){
        const { circleTypes } = _DotGameGlobal;
        const random = Math.floor(Math.random() * circleTypes.length);
        return circleTypes[random];
    }

    /**
     * gets the random starting x coordinate
     * @returns {number} x coordinate
     */
    getInitialXCoordinate(){
        const { canvasBoundingRect } = _DotGameGlobal;
        const xRange = canvasBoundingRect.width - 2 * this.radius;
        return Math.floor(Math.random() * xRange + this.radius);
    }

    /**
     * gets a random rotation direction. clockwise / anti-clockwise
     * @returns {number} 1 if clockwise and -1 if anti clockwise
     */
    getRotationDirection(){
        return Math.random() < 0.5 ? -1 : 1;
    }
    
    static spawnNew(){
        scene.add(new Circle()) //generate a new circle in 1 second
    }

}
