/**
 * Created by wangsheng on 16/9/15.
 */
var CardDropRotateDirection;
(function (CardDropRotateDirection) {
    CardDropRotateDirection[CardDropRotateDirection["Left"] = 0] = "Left";
    CardDropRotateDirection[CardDropRotateDirection["Right"] = 1] = "Right";
})(CardDropRotateDirection || (CardDropRotateDirection = {}));
var color = ["#E63B3B", "#E6E03B", "#4FE63B", "#3BE6C4", "#3B8FE6", "#6F3BE6", "#FF00DE", "#FF5A00"];
var Card = (function () {
    function Card(rowIdx, colIdx, colorIdx) {
        this.left = -1;
        this.top = -1;
        this._enabled = true;
        this.rowIndex = rowIdx;
        this.colIndex = colIdx;
        this._colorIdx = colorIdx;
        this._element = this.createElement();
    }
    Object.defineProperty(Card.prototype, "element", {
        get: function () {
            return this._element;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "colorIdx", {
        get: function () {
            return this._colorIdx;
        },
        enumerable: true,
        configurable: true
    });
    Card.prototype.createElement = function () {
        var frame = document.createElement("div");
        frame.classList.add("card-frame");
        this.left = this.colIndex * (Layout.cardFrameWidth + Layout.spaceBetweenColumn)
            + Layout.spaceBetweenColumn;
        this.top = this.rowIndex * (Layout.cardFrameHeight + Layout.spaceBetweenRow)
            + Layout.spaceBetweenRow;
        frame.style.left = this.left + "px";
        frame.style.top = this.top + "px";
        var card = document.createElement("figure");
        this._card = card;
        frame.appendChild(card);
        card.classList.add("card");
        var backImg = document.createElement("img");
        backImg.classList.add("back");
        backImg.src = "img/card_bg.png";
        var frontImg = document.createElement("img");
        frontImg.classList.add("front");
        frontImg.src = "img/colour" + (this._colorIdx + 1) + ".png";
        card.appendChild(backImg);
        card.appendChild(frontImg);
        return frame;
    };
    Card.prototype.match = function (card) {
        return this._colorIdx === card.colorIdx;
    };
    Card.prototype.flip = function () {
        this._card.classList.add("flip");
    };
    Card.prototype.flipBack = function () {
        this._card.classList.remove("flip");
    };
    Card.prototype.focus = function () {
        this._element.classList.add("focus");
    };
    Card.prototype.unfocus = function () {
        this._element.classList.remove("focus");
    };
    Card.prototype.disable = function (direction) {
        this._enabled = false;
        var _this = this;
        window.setTimeout(function () {
            _this._element.classList.add("disabled");
            if (direction === CardDropRotateDirection.Left)
                _this._element.classList.add("disabled_l");
            if (direction === CardDropRotateDirection.Right)
                _this._element.classList.add("disabled_r");
        }, 500);
    };
    Card.prototype.timedReset = function () {
        var _this = this;
        window.setTimeout(function () {
            _this.flipBack();
        }, 1000);
    };
    Card.prototype.isEnabled = function () {
        return this._enabled;
    };
    Card.prototype.drawInCanvas = function (ctx) {
        ctx.save();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.fillStyle = color[this.colorIdx];
        //border
        ctx.strokeRect(this.left, this.top + Layout.cardsToCanvasOffset, Layout.cardFrameWidth, Layout.cardFrameHeight);
        //+2 for borders.
        ctx.fillRect(this.left + 2, this.top + Layout.cardsToCanvasOffset + 2, Layout.cardWidth, Layout.cardHeight);
        ctx.restore();
    };
    return Card;
}());
var ControlKey;
(function (ControlKey) {
    ControlKey[ControlKey["Up"] = 38] = "Up";
    ControlKey[ControlKey["Down"] = 40] = "Down";
    ControlKey[ControlKey["Left"] = 37] = "Left";
    ControlKey[ControlKey["Right"] = 39] = "Right";
    ControlKey[ControlKey["Enter"] = 13] = "Enter";
    ControlKey[ControlKey["Cheat"] = 67] = "Cheat";
    ControlKey[ControlKey["Reset"] = 82] = "Reset";
    ControlKey[ControlKey["Start"] = 83] = "Start";
})(ControlKey || (ControlKey = {}));
function shuffle(array) {
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
var Grid = (function () {
    function Grid(canvasUtil) {
        this.cr = 0;
        this.cc = 0;
        this.cardList = [];
        this.isCheating = false;
        this.createCard();
        this.ctx = canvasUtil.ctx;
        this.canvasUtil = canvasUtil;
    }
    Grid.prototype.createCard = function () {
        var colorIndices = [];
        for (var i = 0; i < 8; i++) {
            colorIndices.push(i);
            colorIndices.push(i);
        }
        shuffle(colorIndices);
        var el_cards = document.querySelector("#cards");
        var cardNum = 0;
        for (var r = 0; r < 4; r++) {
            var row = [];
            for (var c = 0; c < 4; c++) {
                var card = new Card(r, c, colorIndices[cardNum++]);
                el_cards.appendChild(card.element);
                row.push(card);
            }
            this.cardList.push(row);
        }
        this.focusCard(this.cr, this.cc);
    };
    Grid.prototype.select = function () {
        var card = this.getCurrentCard();
        if (!card.isEnabled())
            return card;
        card.flip();
        return card;
    };
    Grid.prototype.reset = function () {
        var el_cards = document.querySelector("#cards");
        el_cards.innerHTML = "";
        this.cardList = [];
        this.cr = 0;
        this.cc = 0;
        this.createCard();
    };
    Grid.prototype.getCurrentCard = function () {
        return this.cardList[this.cr][this.cc];
    };
    Grid.prototype.focusCard = function (r, c) {
        var card = this.getCurrentCard();
        card.unfocus();
        this.cr = r;
        this.cc = c;
        card = this.getCurrentCard();
        card.focus();
    };
    Grid.prototype.moveUp = function () {
        var c = this.cr - 1;
        if (c > -1)
            this.focusCard(c, this.cc);
    };
    Grid.prototype.moveDown = function () {
        var c = this.cr + 1;
        if (c < 4)
            this.focusCard(c, this.cc);
    };
    Grid.prototype.moveLeft = function () {
        var c = this.cc - 1;
        if (c > -1)
            this.focusCard(this.cr, c);
    };
    Grid.prototype.moveRight = function () {
        var c = this.cc + 1;
        if (c < 4)
            this.focusCard(this.cr, c);
    };
    Grid.prototype.stopCheating = function () {
        this.isCheating = false;
        var card = this.getCurrentCard();
        card.focus();
    };
    Grid.prototype.startCheating = function () {
        this.isCheating = true;
        var card = this.getCurrentCard();
        card.unfocus();
        var canvasWidth = Layout.canvasWidth;
        var canvasHeight = Layout.canvasHeight;
        var ctx = this.ctx;
        var _this = this;
        function animate() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            var mouseX = _this.canvasUtil.mouseX;
            var mouseY = _this.canvasUtil.mouseY;
            if (!_this.isCheating)
                return;
            //draw cards and their true colors
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 50, 0, 360);
            ctx.closePath();
            ctx.clip();
            _this.cardList.forEach(function (rows) {
                rows.forEach(function (card) {
                    if (card.isEnabled())
                        card.drawInCanvas(ctx);
                });
            });
            ctx.restore();
            //draw the glass
            CheatGlass.draw(ctx, mouseX, mouseY);
            window.requestAnimationFrame(animate);
        }
        window.requestAnimationFrame(animate);
    };
    return Grid;
}());
var Controller = (function () {
    function Controller(grid, info) {
        this.username = null;
        this.co = null; //card holding
        this.score = 0;
        this.rm = 16; //remaining matches needed to finish the game.
        this.isCheating = false;
        this.isRunning = false;
        this.grid = grid;
        this.info = info;
        this.bindKeyBoardKeys();
    }
    Controller.prototype.bindKeyBoardKeys = function () {
        var _this = this;
        window.addEventListener("keydown", function (evt) {
            var keyCode = evt.keyCode;
            if (keyCode === ControlKey.Start)
                _this.start();
            if (keyCode === ControlKey.Reset)
                _this.reset();
            if (!_this.isRunning)
                return;
            if (keyCode === ControlKey.Cheat) {
                _this.toggleCheating();
            }
            if (!_this.isCheating) {
                switch (keyCode) {
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
    };
    Controller.prototype.match = function () {
        var currentCard = this.grid.select();
        if (!currentCard.isEnabled())
            return;
        if (this.co === null) {
            this.co = currentCard;
        }
        else if (this.co !== currentCard) {
            if (this.co.match(currentCard)) {
                this.handleMatch(currentCard);
            }
            else {
                this.handleMismatch(currentCard);
            }
        }
    };
    Controller.prototype.handleMatch = function (card) {
        this.co.disable(CardDropRotateDirection.Left);
        card.disable(CardDropRotateDirection.Right);
        this.co = null;
        this.score++;
        this.info.updateScore(this.score);
        this.rm -= 2;
        if (this.rm == 0)
            this.endGame();
    };
    Controller.prototype.handleMismatch = function (card) {
        this.co.timedReset();
        card.timedReset();
        this.co = null;
        this.score--;
        if (this.score < 0)
            this.score = 0;
        this.info.updateScore(this.score);
    };
    Controller.prototype.endGame = function () {
        this.info.end();
    };
    Controller.prototype.askUsername = function () {
        var username = prompt("Please enter your name");
        var el = document.querySelector("#username");
        el.innerText = username;
        this.username = username;
    };
    Controller.prototype.start = function () {
        if (this.username === null)
            this.askUsername();
        //if already started, ignore the command.
        if (this.isRunning)
            return;
        this.isRunning = true;
        var _this = this;
        this.info.start(function () {
            _this.reset();
        });
    };
    Controller.prototype.reset = function () {
        this.isRunning = false;
        this.score = 0;
        this.co = null;
        this.rm = 16;
        this.grid.reset();
        this.info.reset();
        this.endCheating();
    };
    Controller.prototype.toggleCheating = function () {
        if (this.isCheating) {
            this.endCheating();
        }
        else {
            this.startCheating();
        }
    };
    Controller.prototype.startCheating = function () {
        this.isCheating = true;
        this.grid.startCheating();
    };
    Controller.prototype.endCheating = function () {
        this.isCheating = false;
        this.grid.stopCheating();
    };
    return Controller;
}());
var Layout = (function () {
    function Layout() {
    }
    Layout.adjust = function () {
        var cardsSize = Layout.adjustCards();
        Layout.adjustCanvas();
        Layout.adjustConsoleBasedOnCardsSize(cardsSize);
    };
    Layout.adjustCanvas = function () {
        var canvas = document.querySelector("#cards-canvas");
        canvas.width = Layout.canvasWidth;
        canvas.height = Layout.canvasHeight;
        canvas.style.top = "0";
        canvas.style.left = "0";
    };
    Layout.adjustCards = function () {
        var cards = document.querySelector("#cards");
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
        };
    };
    Layout.adjustConsoleBasedOnCardsSize = function (cardsSize) {
        var cs = document.querySelector("#console");
        var offset = cardsSize.width + cardsSize.left;
        cs.style.left = offset + "px";
        var width = Layout.boardWidth - offset;
        cs.style.width = width + "px";
    };
    Layout.boardWidth = 720;
    Layout.boardHeight = 567;
    Layout.canvasWidth = Layout.boardWidth;
    Layout.canvasHeight = Layout.boardHeight;
    Layout.cardWidth = 80;
    Layout.cardHeight = 100;
    Layout.cardFrameWidth = 84;
    Layout.cardFrameHeight = 104;
    Layout.spaceBetweenRow = 10;
    Layout.spaceBetweenColumn = 10;
    Layout.cardsToCanvasOffset = -1;
    return Layout;
}());
var CanvasUtil = (function () {
    function CanvasUtil() {
    }
    CanvasUtil.prototype.init = function () {
        this.canvas = document.querySelector("#cards-canvas");
        var boundingRect = this.canvas.getBoundingClientRect();
        this.canvasWidth = boundingRect.width;
        this.canvasHeight = boundingRect.height;
        this.ctx = this.canvas.getContext('2d');
        var _this = this;
        this.canvas.addEventListener("mousemove", function (evt) {
            _this.windowToMouse(evt.clientX, evt.clientY);
        });
    };
    CanvasUtil.prototype.windowToMouse = function (x, y) {
        this.mouseX = x - this.canvas.getBoundingClientRect().left;
        this.mouseY = y - this.canvas.getBoundingClientRect().top;
    };
    return CanvasUtil;
}());
var GameInfo = (function () {
    function GameInfo() {
        this.intervalId = -1; //count down interval id.
        this.el_score = document.querySelector("#score");
        this.el_remainingTime = document.querySelector("#remaining-time");
        this.el_timeWrapper = document.querySelector("#time-wr");
    }
    GameInfo.prototype.updateScore = function (score) {
        this.el_score.innerText = score.toString();
    };
    GameInfo.prototype.startTimeCountDown = function (callback) {
        var _this = this;
        var el = this.el_remainingTime;
        el.innerText = GameInfo.gameTimeStr;
        var t = GameInfo.gameTime;
        this.intervalId = window.setInterval(function () {
            el.innerText = --t + "s";
            if (t === 45)
                _this.el_timeWrapper.classList.add("highlight");
            if (t === 0) {
                window.clearInterval(_this.intervalId);
                _this.el_timeWrapper.classList.remove("highlight");
                callback();
            }
        }, 1000);
    };
    GameInfo.prototype.resetTimeCountDown = function () {
        this.stopTimeCountDown();
        this.el_remainingTime.innerText = GameInfo.gameTimeStr;
        this.el_score.innerText = GameInfo.initScore;
    };
    GameInfo.prototype.start = function (notEnoughTimeHandler) {
        this.updateScore(0);
        this.startTimeCountDown(notEnoughTimeHandler);
    };
    GameInfo.prototype.end = function () {
        this.stopTimeCountDown();
    };
    GameInfo.prototype.stopTimeCountDown = function () {
        if (this.intervalId === -1)
            return;
        window.clearInterval(this.intervalId);
        this.el_timeWrapper.classList.remove("highlight");
        this.intervalId = -1;
    };
    GameInfo.prototype.reset = function () {
        this.updateScore(0);
        this.resetTimeCountDown();
    };
    GameInfo.gameTime = 90;
    GameInfo.gameTimeStr = GameInfo.gameTime + "s";
    GameInfo.initScore = "0";
    return GameInfo;
}());
var CheatGlass = (function () {
    function CheatGlass() {
    }
    CheatGlass.draw = function (ctx, x, y) {
        var gradientThickness = 20;
        var magnifyingGlassRadius = 60;
        ctx.save();
        ctx.lineWidth = gradientThickness;
        ctx.strokeStyle = 'rgb(0, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, magnifyingGlassRadius, 0, Math.PI * 2, false);
        ctx.clip();
        var gradient = ctx.createRadialGradient(x, y, magnifyingGlassRadius - gradientThickness, x, y, magnifyingGlassRadius);
        gradient.addColorStop(0, 'rgb(0,0,0)');
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
    };
    return CheatGlass;
}());
Layout.adjust();
var canvasUtil = new CanvasUtil();
canvasUtil.init();
var grid = new Grid(canvasUtil);
var info = new GameInfo();
new Controller(grid, info);
//# sourceMappingURL=FlipCard.js.map