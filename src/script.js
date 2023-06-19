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

const canva = document.querySelector("#canva");
const scrolled = document.querySelector("#scrolled");
const newLineBtn = document.querySelector("#add-line");

class Line {
  canvaSize = {
    height: null,
    width: null,
  };
  canvaSideBoundState = {
    last: undefined,
    recent: null,
  };
  lineParams = {
    angle: getRandomNumber(0, 359),
    height: 200,
    posX: null,
    posY: null,
    rotateDirection: 10,
    direction: {
      x: getRandomNumber(-10, 10),
      y: getRandomNumber(-10, 10),
    },
    retainingImages: 20,
  };
  linesCollection = new Map();


  _updateBoundSide = (side) => {
    this.canvaSideBoundState.last = this.canvaSideBoundState.recent;
    this.canvaSideBoundState.recent = side;
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
  }

  remove = () => {
    for (let [key, value] of this.linesCollection) {
      value.lineRef.remove();
      this.linesCollection.delete(key);
    }
  };

  oneFrame = () => {
    let bound = false;
    // define the canva size
    this.canvaSize.height = canva.clientHeight;
    this.canvaSize.width = canva.clientWidth;

    // spawn the line
    const line = document.createElement("span");
    line.className = "line";
    line.style.transform = `rotate(${this.lineParams.angle}deg)`;
    line.style.height = this.lineParams.height + "px";
    canva.append(line);

    // define the canva boundries
    const lineCalcParams = line.getBoundingClientRect();
    const canvaBoundries = {
      left: -Math.floor((line.offsetWidth - lineCalcParams.width) / 2),
      top: -Math.floor((line.offsetHeight - lineCalcParams.height) / 2),
      right: Math.floor(
        this.canvaSize.width - (lineCalcParams.width + line.offsetWidth) / 2
      ),
      bottom: Math.floor(
        this.canvaSize.height - (lineCalcParams.height + line.offsetHeight) / 2
      ),
    };

    // random spawn
    if (this.lineParams.posX === null && this.lineParams.posY === null) {
      this.lineParams.posX = getRandomNumber(
        canvaBoundries.left,
        canvaBoundries.right
      );
      this.lineParams.posY = getRandomNumber(
        canvaBoundries.top,
        canvaBoundries.bottom
      );
    } else {
      // moving logic
      let tempX = this.lineParams.posX + this.lineParams.direction.x;
      let tempY = this.lineParams.posY + this.lineParams.direction.y;

      // check the X bounds
      if (tempX <= canvaBoundries.left - 1) {
        this._updateBoundSide("left");
        [this.lineParams.direction.x, this.lineParams.direction.y] =
          this._reverseDirection(
            this.lineParams.direction.x,
            this.lineParams.direction.y
          );

        tempX = canvaBoundries.left;
        tempY = this.lineParams.posY + this.lineParams.direction.y;
        bound = true;
      } else if (tempX >= canvaBoundries.right - 1) {
        this._updateBoundSide("right");
        [this.lineParams.direction.x, this.lineParams.direction.y] =
          this._reverseDirection(
            this.lineParams.direction.x,
            this.lineParams.direction.y
          );

        tempX = canvaBoundries.right;
        tempY = this.lineParams.posY + this.lineParams.direction.y;
        bound = true;
      }

      // check the Y bounds
      if (tempY <= canvaBoundries.top - 1) {
        this._updateBoundSide("top");
        [this.lineParams.direction.y, this.lineParams.direction.x] =
          this._reverseDirection(
            this.lineParams.direction.y,
            this.lineParams.direction.x
          );

          tempY = canvaBoundries.top;
          tempX = this.lineParams.posX + this.lineParams.direction.x;
          bound = true;
      } else if (tempY >= canvaBoundries.bottom - 1) {
        this._updateBoundSide("bottom");
        [this.lineParams.direction.y, this.lineParams.direction.x] =
          this._reverseDirection(
            this.lineParams.direction.y,
            this.lineParams.direction.x
          );

          tempY = canvaBoundries.bottom;
          tempX = this.lineParams.posX + this.lineParams.direction.x;
          bound = true;
      }

      // update position
      this.lineParams.posX = tempX;
      this.lineParams.posY = tempY;

      // change rotation
      if (
        this.canvaSideBoundState.last !== this.canvaSideBoundState.recent &&
        bound
      ) {
        this.lineParams.rotateDirection = -this.lineParams.rotateDirection;
      }
      this.lineParams.angle += this.lineParams.rotateDirection;
      if (this.lineParams.angle > 359) this.lineParams.angle = 0;
      if (this.lineParams.angle < 0) this.lineParams.angle = 359;
    }

    line.style.left = this.lineParams.posX + "px";
    line.style.top = this.lineParams.posY + "px";

    // update collection
    for (let [key, value] of this.linesCollection) {
      value.timer -= 1;
      value.lineRef.style.opacity =
        (1 / this.lineParams.retainingImages) * value.timer;
      if (value.timer <= 0) {
        value.lineRef.remove();
        this.linesCollection.delete(key);
      }
    }

    this.linesCollection.set(generateRandomKey(), {
      lineRef: line,
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
  let intervalId = setInterval(line.oneFrame, 50);

  // add control
  scrolled.insertAdjacentHTML(
    "beforeend",
    `
  <form class='form-group' id="f${lineNumber}">
    <div class="input-row">
      <label for="l${lineNumber}length">length (px)</label>
      <input type="number" id="l${lineNumber}length" name="l${lineNumber}length" value="200" min="100" max="400">
    </div>
    <div class="input-row">
      <label for="l${lineNumber}velocity">velosity (ms)</label>
      <input type="number" id="l${lineNumber}velocity" name="l${lineNumber}velocity" value="50">
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
    const lineLength = parseFloat(
      document.querySelector(`#l${lineNumber}length`).value
    );
    const lineVelocity = parseFloat(
      document.querySelector(`#l${lineNumber}velocity`).value
    );
    intervalId = newInterval(line.oneFrame, lineVelocity, intervalId);
    line.height(lineLength);
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
