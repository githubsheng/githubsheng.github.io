/**
 * this file pre-defined a list of circle types. Refer to circle class for more details
 */

/**
 * the circle type includes data we needed to create a circle:
 * 1. image used to represent the circle
 * 2. mainColor used to draw the point text when circle is hit
 * 3. radius, if not defined, a random value between a certain range will be provided later when creating a circle
 */
class CircleType {
    constructor(image, mainColor, radius) {
        this.image = image;
        this.mainColor = mainColor;
        this.radius = radius;
    }
}

function initCircleTypes(imgAssets) {
    return [
        new CircleType(imgAssets.get('001'), '#FBF9E6'),
        new CircleType(imgAssets.get('002'), '#DD730C'),
        new CircleType(imgAssets.get('003'), '#F5F8FC'),
        new CircleType(imgAssets.get('004'), '#F5F8FC'),
        new CircleType(imgAssets.get('005'), '#9B8877'),
        new CircleType(imgAssets.get('006'), '#F6BF9F'),
        new CircleType(imgAssets.get('007'), '#FCE1C3'),
        new CircleType(imgAssets.get('008'), '#D52876'),
        new CircleType(imgAssets.get('009'), '#F49C04'),
        new CircleType(imgAssets.get('010'), '#CE567F'),
        new CircleType(imgAssets.get('011'), '#EBED5D'),
        new CircleType(imgAssets.get('012'), '#99CA22'),
        new CircleType(imgAssets.get('x2'), '#FFBD02', 10),
        new CircleType(imgAssets.get('bonus'), '#D9061B', 10),
        new CircleType(imgAssets.get('bonus2'), '#D9061B', 10),
    ];
}