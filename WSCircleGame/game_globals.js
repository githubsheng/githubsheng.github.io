
/**
 * global variables shared across across the entire games.
 * with a decent packaging tool this would look more like a singleton in the application.
 */
const _DotGameGlobal = {
    canvasBoundingRect: null, //the bounding rectangular of our drawing canvas
    ctx: null, //context of our canvas.
    time: {
        currTime: null, //current time in milliseconds
        deltaTime: null, //time passed since we render previous frame.
    },
    speed: {
        fallSpeed: 100, //how fast our circle falls downs. unit: px / second
        rotationSpeed: (Math.PI / 180) * 20 //how fast our circle rotate. unit: px / second
    },
    scene: new Set(), //entities we need to draw in a scene. since this game only has 1 scene, whatever we need to draw are put in here.
    totalPoints: 0, //total points player has scored so far.
    circleTypes: null, //predefined circle types. we create circles of a random type.
    imageAsset: null, //image resources used across the application, think of it as a resource loader in a game engine
    isDebugMode: false, //when true, shows additional information for debug purpose
    renderTotalPoints: function() {
        //this is a bit ugly, as this number is in html rather than in canvas. think of it as GUI that requires
        //special care.
        document.getElementById("total-point").innerText = this.totalPoints;
    }
};