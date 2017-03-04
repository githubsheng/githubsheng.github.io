/**
 * Created by wangsheng on 16/9/15.
 */
enum CardDropRotateDirection {Left, Right}

var color = ["#E63B3B", "#E6E03B", "#4FE63B", "#3BE6C4", "#3B8FE6", "#6F3BE6", "#FF00DE", "#FF5A00"];

class Card {

    private rowIndex: number;
    private colIndex: number;
    private left: number = -1;
    private top: number = -1;
    private _colorIdx: number;
    private _element: HTMLElement;
    private _card:HTMLElement;
    private _enabled: boolean = true;

    constructor(rowIdx: number, colIdx: number, colorIdx: number){
        this.rowIndex = rowIdx;
        this.colIndex = colIdx;
        this._colorIdx = colorIdx;
        this._element = this.createElement();
    }

    get element():HTMLElement {
        return this._element;
    }

    get colorIdx(): number {
        return this._colorIdx;
    }

    private createElement() :HTMLElement{
        var frame: HTMLElement = document.createElement("div");
        frame.classList.add("card-frame");
        this.left = this.colIndex * (Layout.cardFrameWidth + Layout.spaceBetweenColumn)
            + Layout.spaceBetweenColumn;
        this.top = this.rowIndex * (Layout.cardFrameHeight + Layout.spaceBetweenRow)
            + Layout.spaceBetweenRow;
        frame.style.left = this.left + "px";
        frame.style.top = this.top + "px";
        var card:HTMLElement = document.createElement("figure");
        this._card = card;
        frame.appendChild(card);
        card.classList.add("card");
        var backImg:HTMLImageElement = document.createElement("img");
        backImg.classList.add("back");
        backImg.src="img/card_bg.png";
        var frontImg:HTMLImageElement = document.createElement("img");
        frontImg.classList.add("front");
        frontImg.src="img/colour" + (this._colorIdx + 1) + ".png";
        card.appendChild(backImg);
        card.appendChild(frontImg);
        return frame;
    }

    match(card:Card):boolean {
        return this._colorIdx === card.colorIdx;
    }

    flip(){
        this._card.classList.add("flip");
    }

    private flipBack(){
        this._card.classList.remove("flip");
    }

    focus(){
        this._element.classList.add("focus");
    }

    unfocus(){
        this._element.classList.remove("focus");
    }

    disable(direction: CardDropRotateDirection){
        this._enabled = false;
        var _this = this;
        window.setTimeout(function(){
            _this._element.classList.add("disabled");
            if(direction === CardDropRotateDirection.Left)
                _this._element.classList.add("disabled_l");
            if(direction === CardDropRotateDirection.Right)
                _this._element.classList.add("disabled_r");
        }, 500);
    }

    timedReset(){
        var _this = this;
        window.setTimeout(function(){
            _this.flipBack();
        }, 1000);
    }

    isEnabled():boolean{
        return this._enabled;
    }

    drawInCanvas(ctx:CanvasRenderingContext2D){
        ctx.save();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.fillStyle = color[this.colorIdx];
        //border
        ctx.strokeRect(this.left, this.top + Layout.cardsToCanvasOffset, Layout.cardFrameWidth, Layout.cardFrameHeight);

        //+2 for borders.
        ctx.fillRect(this.left + 2, this.top + Layout.cardsToCanvasOffset + 2, Layout.cardWidth, Layout.cardHeight);
        ctx.restore();
    }

}

enum ControlKey {Up = 38, Down = 40, Left = 37, Right = 39, Enter = 13, Cheat = 67, Reset = 82, Start = 83}

function shuffle(array: any[]) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

class Grid {

    private cr:number = 0;
    private cc:number = 0;
    private cardList:Card[][] = [];
    private ctx: CanvasRenderingContext2D;
    private canvasUtil: CanvasUtil;
    private isCheating: boolean =false;


    constructor(canvasUtil: CanvasUtil) {
        this.createCard();
        this.ctx = canvasUtil.ctx;
        this.canvasUtil = canvasUtil;
    }


    private createCard(){
        var colorIndices:number[] = [];
        for(var i = 0; i < 8; i++) {
            colorIndices.push(i);
            colorIndices.push(i);
        }
        shuffle(colorIndices);

        var el_cards = document.querySelector("#cards");

        var cardNum = 0;
        for(var r = 0; r < 4; r++){
            var row:Card[] = [];
            for(var c = 0; c < 4; c++){
                var card = new Card(r, c, colorIndices[cardNum++]);
                el_cards.appendChild(card.element);
                row.push(card);
            }
            this.cardList.push(row);
        }
        this.focusCard(this.cr, this.cc);
    }

    select():Card{
        var card = this.getCurrentCard();
        if(!card.isEnabled())
            return card;
        card.flip();
        return card;
    }

    reset(){
        var el_cards = <HTMLElement> document.querySelector("#cards");
        el_cards.innerHTML = "";

        this.cardList = [];
        this.cr = 0;
        this.cc = 0;
        this.createCard();
    }

    private getCurrentCard(): Card {
        return this.cardList[this.cr][this.cc];
    }

    private focusCard(r:number, c:number){
        var card = this.getCurrentCard();
        card.unfocus();
        this.cr = r;
        this.cc = c;
        card = this.getCurrentCard();
        card.focus();
    }


    moveUp(){
        var c = this.cr - 1;
        if(c > -1)
            this.focusCard(c, this.cc);
    }

    moveDown(){
        var c = this.cr + 1;
        if(c < 4)
            this.focusCard(c, this.cc);
    }

    moveLeft(){
        var c = this.cc - 1;
        if(c > -1)
            this.focusCard(this.cr, c);
    }

    moveRight(){
        var c = this.cc + 1;
        if(c < 4)
            this.focusCard(this.cr, c);
    }

    stopCheating(){
        this.isCheating = false;
        var card = this.getCurrentCard();
        card.focus();
    }

    startCheating(){
        this.isCheating = true;
        var card = this.getCurrentCard();
        card.unfocus();

        var canvasWidth = Layout.canvasWidth;
        var canvasHeight = Layout.canvasHeight;
        var ctx = this.ctx;
        var _this = this;

        function animate(){

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            var mouseX = _this.canvasUtil.mouseX;
            var mouseY = _this.canvasUtil.mouseY;

            if(!_this.isCheating)
                return;

            //draw cards and their true colors
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 50, 0, 360);
            ctx.closePath();
            ctx.clip();

            _this.cardList.forEach(function(rows: Card[]){
                rows.forEach(function(card:Card){
                    if(card.isEnabled())
                        card.drawInCanvas(ctx);
                });
            });
            ctx.restore();

            //draw the glass
            CheatGlass.draw(ctx, mouseX, mouseY);

            window.requestAnimationFrame(animate);
        }

        window.requestAnimationFrame(animate);
    }

}

class Controller {

    private username: String = null;
    private grid:Grid;
    private co:Card = null; //card holding
    private score:number = 0;
    private rm:number = 16; //remaining matches needed to finish the game.
    private isCheating: boolean = false;
    private isRunning: boolean = false;

    private info: GameInfo;

    constructor(grid:Grid, info: GameInfo){
        this.grid = grid;
        this.info = info;
        this.bindKeyBoardKeys();
    }

    private bindKeyBoardKeys(){
        var _this = this;
        window.addEventListener("keydown", function(evt:KeyboardEvent){

            var keyCode = evt.keyCode;

            if(keyCode === ControlKey.Start)
                _this.start();

            if(keyCode === ControlKey.Reset)
                _this.reset();

            if(!_this.isRunning)
                return;

            if(keyCode === ControlKey.Cheat){
                _this.toggleCheating();
            }

            if(!_this.isCheating){
                switch(keyCode){
                    case ControlKey.Up:
                        _this.grid.moveUp();
                        break;
                    case ControlKey.Down:
                        _this.grid.moveDown();
                        break;
                    case ControlKey.Left:
                        _this.grid.moveLeft();
                        break;
                    case ControlKey.Right:
                        _this.grid.moveRight();
                        break;
                    case ControlKey.Enter:
                        _this.match();
                        break;
                    default:
                        break;
                }
            }
            evt.preventDefault();
        });
    }

    private match(){
        var currentCard = this.grid.select();
        if(!currentCard.isEnabled())
            return;
        if(this.co === null) {
            this.co = currentCard;
        } else if(this.co !== currentCard) {
            if(this.co.match(currentCard)){
                this.handleMatch(currentCard);
            } else {
                this.handleMismatch(currentCard);
            }
        }
    }

    private handleMatch(card:Card){

        this.co.disable(CardDropRotateDirection.Left);
        card.disable(CardDropRotateDirection.Right);

        this.co = null;

        this.score ++;
        this.info.updateScore(this.score);

        this.rm -= 2;
        if(this.rm == 0)
            this.endGame();

    }

    private handleMismatch(card:Card){
        this.co.timedReset();
        card.timedReset();

        this.co = null;

        this.score --;
        if(this.score < 0)
            this.score = 0;
        this.info.updateScore(this.score);
    }

    private endGame(){
        this.info.end();
    }

    private askUsername(){
        var username = prompt("Please enter your name");
        var el = <HTMLElement>document.querySelector("#username");
        el.innerText = username;
        this.username = username;
    }

    private start(){
        if(this.username === null)
            this.askUsername();

        //if already started, ignore the command.
        if(this.isRunning)
            return;

        this.isRunning = true;
        var _this = this;

        this.info.start(function(){
            _this.reset();
        });
    }

    private reset(){
        this.isRunning = false;
        this.score = 0;
        this.co = null;
        this.rm = 16;
        this.grid.reset();
        this.info.reset();
        this.endCheating();
    }

    private toggleCheating(){
        if(this.isCheating) {
            this.endCheating();
        } else {
            this.startCheating();
        }

    }

    private startCheating(){
        this.isCheating = true;
        this.grid.startCheating();
    }

    private endCheating(){
        this.isCheating = false;
        this.grid.stopCheating();
    }

}

class Layout {
    static boardWidth = 720;
    static boardHeight = 567;
    static canvasWidth = Layout.boardWidth;
    static canvasHeight = Layout.boardHeight;
    static cardWidth = 80;
    static cardHeight = 100;
    static cardFrameWidth = 84;
    static cardFrameHeight = 104;
    static spaceBetweenRow = 10;
    static spaceBetweenColumn = 10;
    static cardsToCanvasOffset = -1;

    static adjust(){
        var cardsSize = Layout.adjustCards();
        Layout.adjustCanvas();
        Layout.adjustConsoleBasedOnCardsSize(cardsSize);
    }

    private static adjustCanvas() {
        var canvas = <HTMLCanvasElement>document.querySelector("#cards-canvas");
        canvas.width = Layout.canvasWidth;
        canvas.height = Layout.canvasHeight;
        canvas.style.top = "0";
        canvas.style.left = "0";
    }


    private static adjustCards(): {width: number; height: number; left: number; top: number}{
        var cards:HTMLElement = <HTMLElement> document.querySelector("#cards");
        var width = Layout.cardFrameWidth * 4 + Layout.spaceBetweenRow * 5;
        var height = Layout.cardFrameHeight * 4 + Layout.spaceBetweenColumn * 5;
        cards.style.width = width + "px";
        cards.style.height = height + "px";
        var top = (Layout.boardHeight - height) / 2;
        cards.style.top = top + "px";
        Layout.cardsToCanvasOffset = top;
        return {
            width: width,
            height: height,
            top: top,
            left: 0
        }
    }

    private static adjustConsoleBasedOnCardsSize(cardsSize: {width: number; height: number; left: number; top: number}) {
        var cs = <HTMLElement>document.querySelector("#console");
        var offset = cardsSize.width + cardsSize.left;
        cs.style.left = offset + "px";
        var width = Layout.boardWidth - offset;
        cs.style.width =  width + "px";
    }


}

class CanvasUtil {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    canvasWidth: number;
    canvasHeight: number;
    mouseX: number;
    mouseY: number;


    init(){
        this.canvas = <HTMLCanvasElement> document.querySelector("#cards-canvas");
        var boundingRect = this.canvas.getBoundingClientRect();
        this.canvasWidth = boundingRect.width;
        this.canvasHeight = boundingRect.height;
        this.ctx = this.canvas.getContext('2d');
        var _this = this;
        this.canvas.addEventListener("mousemove", function(evt: MouseEvent){
            _this.windowToMouse(evt.clientX, evt.clientY);
        });
    }

    private windowToMouse(x:number, y:number) {
        this.mouseX =  x - this.canvas.getBoundingClientRect().left;
        this.mouseY = y - this.canvas.getBoundingClientRect().top;
    }
}

class GameInfo {

    private el_score: HTMLElement;
    private el_remainingTime: HTMLElement;
    private el_timeWrapper: HTMLElement;
    private intervalId: number = -1; //count down interval id.

    private static gameTime = 90;
    private static gameTimeStr = GameInfo.gameTime + "s";
    private static initScore = "0";

    constructor(){
        this.el_score = <HTMLElement>document.querySelector("#score");
        this.el_remainingTime = <HTMLElement>document.querySelector("#remaining-time");
        this.el_timeWrapper = <HTMLElement>document.querySelector("#time-wr");
    }

    updateScore(score:number){
        this.el_score.innerText = score.toString();
    }

    private startTimeCountDown(callback: () => void){
        var _this = this;
        var el = this.el_remainingTime;
        el.innerText = GameInfo.gameTimeStr;
        var t = GameInfo.gameTime;
        this.intervalId = window.setInterval(function(){
            el.innerText = --t + "s";
            if(t === 45)
                _this.el_timeWrapper.classList.add("highlight");
            if(t === 0) {
                window.clearInterval(_this.intervalId);
                _this.el_timeWrapper.classList.remove("highlight");
                callback();
            }
        }, 1000);
    }

    private resetTimeCountDown(){
        this.stopTimeCountDown();
        this.el_remainingTime.innerText = GameInfo.gameTimeStr;
        this.el_score.innerText = GameInfo.initScore;
    }

    start(notEnoughTimeHandler: () => void){
        this.updateScore(0);
        this.startTimeCountDown(notEnoughTimeHandler);
    }

    end(){
        this.stopTimeCountDown();
    }

    private stopTimeCountDown(){
        if(this.intervalId === -1)
            return;
        window.clearInterval(this.intervalId);
        this.el_timeWrapper.classList.remove("highlight");
        this.intervalId = -1;
    }

    reset(){
        this.updateScore(0);
        this.resetTimeCountDown();
    }

}

class CheatGlass {

    static draw(ctx: CanvasRenderingContext2D, x: number, y: number){
        var gradientThickness = 20;
        var magnifyingGlassRadius = 60;
        ctx.save();
        ctx.lineWidth = gradientThickness;
        ctx.strokeStyle = 'rgb(0, 0, 255, 0.3)';

        ctx.beginPath();
        ctx.arc(x, y, magnifyingGlassRadius, 0, Math.PI*2, false);
        ctx.clip();

        var gradient = ctx.createRadialGradient(x, y, magnifyingGlassRadius-gradientThickness, x, y, magnifyingGlassRadius);
        gradient.addColorStop(0,   'rgb(0,0,0)');
        gradient.addColorStop(0.80, 'rgb(235,237,255)');
        gradient.addColorStop(0.90, 'rgb(235,237,255)');
        gradient.addColorStop(1.0, 'rgb(150,150,150)');

        ctx.shadowColor = 'rgba(52, 72, 35, 1.0)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 20;

        ctx.strokeStyle = gradient;
        ctx.stroke();

        ctx.restore();
    }
}

Layout.adjust();
var canvasUtil = new CanvasUtil();
canvasUtil.init();
var grid = new Grid(canvasUtil);
var info = new GameInfo();
new Controller(grid, info);