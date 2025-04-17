console.log("Hi");

const READ_INPUT_INTERVAL = 30;
const SEND_INPUT_INTERVAL = 20;
const DEADZONE = 0.2;
const MIN_DUTY = 0.1;

const KEYCODE_LEFT = 37;
const KEYCODE_RIGHT = 39;

let gamepadIndex = -1;
let x = 0;

// let timeSinceLastInput = 0;
// let pressed = false;

let holdTimeout = null;

window.addEventListener("gamepadconnected", (e) => {
  gamepadIndex = e.gamepad.index;
});

function applyDeadzone(value, deadzone) {
  if (value > deadzone) {
    return (value - deadzone) / (1 - deadzone);
  }

  if (value < -deadzone) {
    return (value + deadzone) / (1 - deadzone);
  }

  return 0;
}

function pressKey(keyCode) {
  window.dispatchEvent(new KeyboardEvent("keydown", { keyCode }));
}

function releaseKey(keyCode) {
  window.dispatchEvent(new KeyboardEvent("keyup", { keyCode }));
}

function readGamepad() {
  if (gamepadIndex < 0) return;

  const gamepad = navigator.getGamepads()[gamepadIndex];

  x = applyDeadzone(gamepad.axes[2], DEADZONE);
  if (x === 0) {
    x = applyDeadzone(gamepad.axes[0], DEADZONE);
  }
}

function sendInput() {
  if (holdTimeout != null) {
    clearTimeout(holdTimeout);
    releaseKey(KEYCODE_LEFT);
    releaseKey(KEYCODE_RIGHT);
    holdTimeout = null;
  }

  if (x === 0) return;

  const dutyInterval = Math.abs(x) * (1 - MIN_DUTY) + MIN_DUTY;
  const onTime = Math.floor(SEND_INPUT_INTERVAL * dutyInterval);

  const key = x > 0 ? KEYCODE_RIGHT : KEYCODE_LEFT;

  pressKey(key);
  holdTimeout = setTimeout(() => {
    releaseKey(key);
  }, onTime);
}

setInterval(readGamepad, READ_INPUT_INTERVAL);
setInterval(sendInput, SEND_INPUT_INTERVAL);
