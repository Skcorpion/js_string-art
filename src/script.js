"use strict";

const wrapper = document.querySelector(".wrapper");
const scrolled = document.querySelector(".scrolled");
const newLineBtn = document.querySelector("#new-line_btn");

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomKey() {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${timestamp}_${randomNumber}`;
}

function createLine() {
  let wrapperHeight = wrapper.clientHeight;
  let wrapperWidth = wrapper.clientWidth;
  // spawn the line with a random angle
  const line = document.createElement("span");
  line.className = "line";
  let lineAngle = getRandomNumber(0, 359);
  line.style.transform = `rotate(${lineAngle}deg)`;
  let lineHeight = 200;
  line.style.height = lineHeight + "px";
  wrapper.append(line);

  // define the field boundries
  let lineParams = line.getBoundingClientRect();
  let minX = -Math.floor((line.offsetWidth - lineParams.width) / 2);
  let minY = -Math.floor((line.offsetHeight - lineParams.height) / 2);
  let maxX = Math.floor(
    wrapperWidth - (lineParams.width + line.offsetWidth) / 2
  );
  let maxY = Math.floor(
    wrapperHeight - (lineParams.height + line.offsetHeight) / 2
  );
  // console.log("maxX, minX, maxY, minY - ", maxX, minX, maxY, minY);

  // change the line position to a random coordinates
  // let posX = minX;
  // let posY = minY;
  let posX = getRandomNumber(minX, maxX);
  let posY = getRandomNumber(minY, maxY);
  // console.log(`y: ${posY}, x: ${posX}`);
  line.style.left = posX + "px";
  line.style.top = posY + "px";
  // console.log(line.getBoundingClientRect());

  let rotateDirection = 10;
  const sideBoundState = {
    last: undefined,
    recent: null,
  };
  const fadedCount = 20;
  const linesCollection = new Map();
  linesCollection.set(generateRandomKey(), {
    lineRef: line,
    timer: fadedCount,
  });

  const direction = {
    x: getRandomNumber(-10, 10),
    y: getRandomNumber(-10, 10),
  };
  //later transfer to object or add methods
  return function (length = 200, remove = false) {
    if (remove) {
      for (let [key, value] of linesCollection) {
          value.lineRef.remove();
          linesCollection.delete(key);
      }
    } else {
      wrapperHeight = wrapper.clientHeight;
      wrapperWidth = wrapper.clientWidth;

      // const distanceToMove = 20;
      // function getNewCoordinates(lineAngle, distanceToMove, posX, posY) {
      //   const radians = (lineAngle * Math.PI) / 180;
      //   const tempX = posX + Math.cos(radians) * distanceToMove;
      //   const tempY = posY + Math.sin(radians) * distanceToMove;

      //   if (tempX >= maxX || tempX <= minX || tempY >= maxY || tempY <= minY) {
      //     console.log('boom');
      //     ({lineAngle, posX, posY} = getNewCoordinates(lineAngle, distanceToMove, posX, posY));
      //     lineAngle = getRandomNumber(0, 359);
      //   } else {
      //     posX = tempX;
      //     posY = tempY;
      //   }

      //   return {
      //     lineAngle, posX, posY
      //   }
      // }

      // ({lineAngle, posX, posY} = getNewCoordinates(lineAngle, distanceToMove, posX, posY));
      let bound = false;
      let tempX = posX + direction.x;
      let tempY = posY + direction.y;
      if (tempX >= maxX - 1) {
        // console.log("maxX, minX, tempX - ", maxX, minX, tempX);
        sideBoundState.last = sideBoundState.recent;
        sideBoundState.recent = "right";
        direction.x =
          direction.x >= 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        direction.y =
          direction.y < 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        tempY = posY + direction.y;
        tempX = maxX;
        bound = true;
      } else if (tempX <= minX - 1) {
        sideBoundState.last = sideBoundState.recent;
        sideBoundState.recent = "left";
        direction.x =
          direction.x >= 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        direction.y =
          direction.y < 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        tempY = posY + direction.y;
        tempX = minX;
        bound = true;
      }

      if (tempY >= maxY - 1) {
        // console.log("maxY, minY, tempY - ", maxY, minY, tempY);
        sideBoundState.last = sideBoundState.recent;
        sideBoundState.recent = "bottom";
        direction.y =
          direction.y >= 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        direction.x =
          direction.x < 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        tempX = posX + direction.x;
        tempY = maxY;
        bound = true;
      } else if (tempY <= minY - 1) {
        sideBoundState.last = sideBoundState.recent;
        sideBoundState.recent = "top";
        direction.y =
          direction.y >= 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        direction.x =
          direction.x < 0 ? getRandomNumber(-10, 0) : getRandomNumber(0, 10);
        tempX = posX + direction.x;
        tempY = minY;
        bound = true;
      }
      posX = tempX;
      posY = tempY;
      if (sideBoundState.last !== sideBoundState.recent && bound)
        rotateDirection = -rotateDirection;
      lineAngle += rotateDirection;
      if (lineAngle > 359) lineAngle = 0;
      if (lineAngle < 0) lineAngle = 359;

      const newLine = document.createElement("span");
      newLine.className = "line";
      newLine.style.transform = `rotate(${lineAngle}deg)`;
      if (length >= 100) lineHeight = length;
      newLine.style.height = lineHeight + "px";
      wrapper.append(newLine);

      if (true) {
        // console.log('lineAngle - ', lineAngle);
        lineParams = newLine.getBoundingClientRect();
        minX = -Math.floor((newLine.offsetWidth - lineParams.width) / 2);
        minY = -Math.floor((newLine.offsetHeight - lineParams.height) / 2);
        maxX = Math.floor(
          wrapperWidth - (lineParams.width + newLine.offsetWidth) / 2
        );
        maxY = Math.floor(
          wrapperHeight - (lineParams.height + newLine.offsetHeight) / 2
        );
      }

      newLine.style.left = posX + "px";
      newLine.style.top = posY + "px";

      for (let [key, value] of linesCollection) {
        value.timer -= 1;
        value.lineRef.style.opacity = (1 / fadedCount) * value.timer;
        if (value.timer <= 0) {
          value.lineRef.remove();
          linesCollection.delete(key);
        }
      }

      linesCollection.set(generateRandomKey(), {
        lineRef: newLine,
        timer: fadedCount,
      });
    }
  };
}

function newInterval(line, ms, id) {
  clearInterval(id);
  return (id = setInterval(line, ms));
}

let activeLines = 0;
newLineBtn.addEventListener("click", () => {
  activeLines += 1;
  const lineNumber = activeLines;
  const line = createLine();
  let intervalId = setInterval(line, 50);
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
    <button id="l${lineNumber}btn">Apply</button>
    <button id="l${lineNumber}btn-remove" class="remove-btn">X</button>
  </form>
  `
  );
  const applyBtn = document.querySelector(`#l${lineNumber}btn`);
  applyBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const lineLength = parseFloat(
      document.querySelector(`#l${lineNumber}length`).value
    );
    const lineVelocity = parseFloat(
      document.querySelector(`#l${lineNumber}velocity`).value
    );
    intervalId = newInterval(line, lineVelocity, intervalId);
    line(lineLength);
  });

  const removeBtn = document.querySelector(`#l${lineNumber}btn-remove`);
  removeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    clearInterval(intervalId);
    line(0, true);
    document.querySelector(`#f${lineNumber}`).remove();
  })
});
