"use strict";

//helper functions
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomKey() {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${timestamp}_${randomNumber}`;
}

function newInterval(line, ms, id) {
  clearInterval(id);
  return (id = setInterval(line, ms));
}

function calculateSideCoordinates(xMid, yMid, height, angle) {
  const angleRadians = (angle * Math.PI) / 180;
  const halfHeight = height / 2;

  const dx = halfHeight * Math.cos(angleRadians);
  const dy = halfHeight * Math.sin(angleRadians);

  const x1 = xMid - dx;
  const y1 = yMid - dy;
  const x2 = xMid + dx;
  const y2 = yMid + dy;

  return [x1, y1, x2, y2];
}

function createGradient(ctx, posObj, opacity) {
  const { x1, y1, x2, y2 } = posObj;
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, `rgba(2,0,36,${opacity})`);
  gradient.addColorStop(0.5, `rgba(93,93,152,${opacity})`);
  gradient.addColorStop(1, `rgba(0,212,255,${opacity})`);

  return gradient;
}

function drawLine(ctx, posObj, opacity) {
  const { x1, y1, x2, y2 } = posObj;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = createGradient(ctx, posObj, opacity);
  ctx.stroke();
}

const canvasContainer = document.querySelector("#canvas-container");
const scrolled = document.querySelector("#scrolled");
const newLineBtn = document.querySelector("#add-line");

class Line {
  canvas = null;
  ctx = null;
  canvaSize = {
    height: null,
    width: null,
  };
  canvaSideBoundState = {
    last: undefined,
    recent: null,
  };
  lineParams = {
    angle: {
      current: null,
      next: getRandomNumber(0, 359),
    },
    height: 200,
    xMid: null,
    yMid: null,
    rotateDirection: 5,
    direction: {
      x: getRandomNumber(-10, 10),
      y: getRandomNumber(-10, 10),
    },
    retainingImages: 20,
  };
  linesCollection = new Map();

  _updateBoundSide = (side) => {
    const { recent } = this.canvaSideBoundState;
    this.canvaSideBoundState = {
      last: recent,
      recent: side,
    };
  };

  _reverseDirection = (boundAxis, perpendicularAxis) => {
    boundAxis =
      boundAxis >= 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
    perpendicularAxis =
      perpendicularAxis < 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
    return [boundAxis, perpendicularAxis];
  };

  height = (number) => {
    this.lineParams.height = number;
  };

  remove = () => {
    this.canvas.remove();
  };

  oneFrame = () => {
    this.lineParams.angle.current = this.lineParams.angle.next;
    let bound = false;
    // define the canva & context
    if (this.canvas === null) {
      this.canvas = document.createElement("canvas");
      canvasContainer.append(this.canvas);
      this.ctx = this.canvas.getContext("2d");
    }

    // define the canva size
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.ctx.lineWidth = 5;

    // define the canva boundries
    const canvaBoundries = {
      left: 0,
      top: 0,
      right: this.canvas.width,
      bottom: this.canvas.height,
    };

    const defineCanvaBoundries = () => {
      let [x1, y1] = calculateSideCoordinates(
        0,
        0,
        this.lineParams.height,
        this.lineParams.angle.current
      );
      x1 = Math.abs(x1);
      y1 = Math.abs(y1);

      canvaBoundries.right -= x1;
      canvaBoundries.left += x1;

      canvaBoundries.bottom -= y1;
      canvaBoundries.top += y1;
    };
    defineCanvaBoundries();

    // random spawn
    if (this.lineParams.xMid === null && this.lineParams.yMid === null) {
      this.lineParams.xMid = getRandomNumber(
        canvaBoundries.left,
        canvaBoundries.right
      );
      this.lineParams.yMid = getRandomNumber(
        canvaBoundries.top,
        canvaBoundries.bottom
      );
    } else {
      // moving logic
      let tempX = this.lineParams.xMid + this.lineParams.direction.x;
      let tempY = this.lineParams.yMid + this.lineParams.direction.y;
      // check the X bounds
      if (tempX < canvaBoundries.left) {
        this._updateBoundSide("left");
        [this.lineParams.direction.x, this.lineParams.direction.y] =
          this._reverseDirection(
            this.lineParams.direction.x,
            this.lineParams.direction.y
          );

        tempX = canvaBoundries.left;
        tempY = this.lineParams.yMid + this.lineParams.direction.y;
        bound = true;
      } else if (tempX > canvaBoundries.right) {
        this._updateBoundSide("right");
        [this.lineParams.direction.x, this.lineParams.direction.y] =
          this._reverseDirection(
            this.lineParams.direction.x,
            this.lineParams.direction.y
          );

        tempX = canvaBoundries.right;
        tempY = this.lineParams.yMid + this.lineParams.direction.y;
        bound = true;
      }

      // check the Y bounds
      if (tempY < canvaBoundries.top) {
        this._updateBoundSide("top");
        [this.lineParams.direction.y, this.lineParams.direction.x] =
          this._reverseDirection(
            this.lineParams.direction.y,
            this.lineParams.direction.x
          );

        tempY = canvaBoundries.top;
        tempX = this.lineParams.xMid + this.lineParams.direction.x;
        bound = true;
      } else if (tempY > canvaBoundries.bottom) {
        this._updateBoundSide("bottom");
        [this.lineParams.direction.y, this.lineParams.direction.x] =
          this._reverseDirection(
            this.lineParams.direction.y,
            this.lineParams.direction.x
          );

        tempY = canvaBoundries.bottom;
        tempX = this.lineParams.xMid + this.lineParams.direction.x;
        bound = true;
      }

      // update position
      this.lineParams.xMid = tempX;
      this.lineParams.yMid = tempY;
    }

    // change rotation
    if (
      this.canvaSideBoundState.last !== this.canvaSideBoundState.recent &&
      bound
    ) {
      this.lineParams.rotateDirection = -this.lineParams.rotateDirection;
    }
    this.lineParams.angle.next += this.lineParams.rotateDirection;
    if (this.lineParams.angle.next > 359) this.lineParams.angle.next = 0;
    if (this.lineParams.angle.next < 0) this.lineParams.angle.next = 359;

    // draw new line
    const [x1, y1, x2, y2] = calculateSideCoordinates(
      this.lineParams.xMid,
      this.lineParams.yMid,
      this.lineParams.height,
      this.lineParams.angle.current
    )
    drawLine(
      this.ctx,
      { x1, y1, x2, y2 },
      1
    );
    // draw all lines in collection
    for (let [key, value] of this.linesCollection) {
      value.timer -= 1;
      if (value.timer <= 0) {
        this.linesCollection.delete(key);
      } else {
        const opacity = (1 / this.lineParams.retainingImages) * value.timer;
        const { x1, y1, x2, y2 } = value.lineCoords;
        drawLine(this.ctx, { x1, y1, x2, y2 }, opacity);
      }
    }
    // update collection
    this.linesCollection.set(generateRandomKey(), {
      lineCoords: {
        x1,
        y1,
        x2,
        y2,
      },
      timer: this.lineParams.retainingImages,
    });
  };
}

let activeLines = 0;
newLineBtn.addEventListener("click", () => {
  activeLines += 1;
  const lineNumber = activeLines;

  // start
  const line = new Line();
  const lineHeight = getRandomNumber(100, 200);
  const lineVelocity = getRandomNumber(20, 50)
  line.height(lineHeight)
  let intervalId = setInterval(line.oneFrame, lineVelocity);

  // add control
  scrolled.insertAdjacentHTML(
    "beforeend",
    `
  <form class='form-group' id="f${lineNumber}">
    <div class="input-row">
      <label for="l${lineNumber}length">length (px)</label>
      <input type="number" id="l${lineNumber}length" name="l${lineNumber}length" value="${lineHeight}" min="100" max="300">
    </div>
    <div class="input-row">
      <label for="l${lineNumber}velocity">velosity (ms)</label>
      <input type="number" id="l${lineNumber}velocity" name="l${lineNumber}velocity" value="${lineVelocity}" min="20" max="50">
    </div>
    <button id="l${lineNumber}btn" class="apply">Apply</button>
    <button id="l${lineNumber}btn-remove" class="remove">X</button>
  </form>
  `
  );

  // apply button
  const applyBtn = document.querySelector(`#l${lineNumber}btn`);
  applyBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const lineHeight = parseFloat(
      document.querySelector(`#l${lineNumber}length`).value
    );
    const lineVelocity = parseFloat(
      document.querySelector(`#l${lineNumber}velocity`).value
    );
    intervalId = newInterval(line.oneFrame, lineVelocity, intervalId);
    line.height(lineHeight);
  });

  // remove button
  const removeBtn = document.querySelector(`#l${lineNumber}btn-remove`);
  removeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    clearInterval(intervalId);
    line.remove();
    document.querySelector(`#f${lineNumber}`).remove();
  });
});
