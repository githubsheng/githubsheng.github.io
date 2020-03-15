async function main(){
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    _DotGameGlobal.canvasBoundingRect = canvas.getBoundingClientRect();
    _DotGameGlobal.ctx = canvas.getContext("2d");
    _DotGameGlobal.time.currTime = Date.now();
    const imageAsset = await prepareImageAsset();
    _DotGameGlobal.circleTypes  = initCircleTypes(imageAsset);
    const { scene } = _DotGameGlobal;

    attachEventHandlers();

    // const totalPoints = new PointText(100, 100);

    //we generate a new dot every 1 second no matter what, as requested by project requirement.
    setInterval(() => {
       const circle = new Circle();
       scene.add(circle);
    }, 1000);

    canvas.addEventListener("click", (event) => {
        //todo: prevent too frequent clicks...
        const clickCoord = {
            x: event.clientX - _DotGameGlobal.canvasBoundingRect.left,
            y: event.clientY - _DotGameGlobal.canvasBoundingRect.top
        };

        let cand = null; //cand: candidate. We will call onClick method of this candidate.
        for(let entity of scene) {
            //if multiple entities are clicked (eg. one overlay on top of another and their position are both close
            // enough to our click position), we want to remove the one that is on top. When we draw the entities
            //on canvas, we draw them one by one as we loop through the scene, whatever comes later during the loop
            //is drawn on top of everything before it. This explains why we do not break when we find our first candidate.
            if(entity.isCoordInRange && entity.onClick && entity.isCoordInRange(clickCoord)) cand = entity;
        }
        cand && cand.onClick();
    });

    requestAnimationFrame(renderFrame);

    function renderFrame() {
        const { ctx, canvasBoundingRect } = _DotGameGlobal;
        updateTime();
        ctx.clearRect(0, 0, canvasBoundingRect.width, canvasBoundingRect.height);
        for(let entity of scene) entity.render();
        if(_DotGameGlobal.isDebugMode) Debug.drawFrameRate();
        requestAnimationFrame(renderFrame);
    }
}

function updateTime(){
    const { time } = _DotGameGlobal;
    const curr = Date.now();
    time.deltaTime = (curr - time.currTime) / 1000;
    time.currTime = curr;
}

function attachEventHandlers() {
    document.getElementById("reset").addEventListener("click", () => {
        _DotGameGlobal.totalPoints = 0;
        _DotGameGlobal.renderTotalPoints();
    });

    document.getElementById("info").addEventListener("click", () => {
        document.getElementById("notice").className = "full-screen-modal";
    });

    document.getElementById("total-point").addEventListener("click", () => {
        _DotGameGlobal.isDebugMode = !_DotGameGlobal.isDebugMode;
    });

    document.getElementById("notice-to-game").addEventListener("click", () => {
        document.getElementById("notice").className = "full-screen-modal hide";
    });
}

main();
