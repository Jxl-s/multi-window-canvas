const SESSION_UUID = Math.random().toString();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// If there's no windows, set it for now
if (!localStorage.getItem("windows")) {
    localStorage.setItem("windows", "{}");
}

// Uses the outer width to determine position of the window
function calculateScreenCenter() {
    const outerWidth = window.outerWidth;
    const outerHeight = window.outerHeight;

    const centerX = window.screenX + outerWidth / 2;
    const centerY = window.screenY + outerHeight / 2;

    return { centerX, centerY };
}

function drawLine(startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
}

const startTime = Date.now();
let lastDelta = Date.now();

function getDelta() {
    const delta = Date.now() - lastDelta;
    lastDelta = Date.now();
    return delta;
}

function getElapsedTime() {
    return Date.now() - startTime;
}

const MOVE_AMPLITUDE_X = Math.random() * 100;
const MOVE_FREQUENCY_X = Math.random() * 1000;
const MOVE_AMPLITUDE_Y = Math.random() * 100;
const MOVE_FREQUENCY_Y = Math.random() * 1000;

const MOVE_OFFSET_X = Math.random() * 100;
const MOVE_OFFSET_Y = Math.random() * 100;

function animate() {
    const windows = JSON.parse(localStorage.getItem("windows"));

    // Update the session
    const { centerX, centerY } = calculateScreenCenter();
    const [offsetX, offsetY] = [
        Math.sin(getElapsedTime() / MOVE_FREQUENCY_X + MOVE_OFFSET_X) *
            MOVE_AMPLITUDE_X,
        Math.sin(getElapsedTime() / MOVE_FREQUENCY_Y + MOVE_OFFSET_Y) *
            MOVE_AMPLITUDE_Y,
    ];
    windows[SESSION_UUID] = {
        time: Date.now(),
        centerX: centerX + offsetX,
        centerY: centerY + offsetY,
    };

    // If one hasn't pinged for 1 seconds, remove
    for (const uuid in windows) {
        if (Date.now() - windows[uuid].time > 1000) {
            delete windows[uuid];
        }
    }

    // Resize the canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw a point from each center, to each other's center
    for (const uuid in windows) {
        for (const uuid2 in windows) {
            if (uuid === uuid2) continue;

            const window1 = windows[uuid];
            const window2 = windows[uuid2];

            // conver these position to relative to my screen
            const window1X = window1.centerX - window.screenX;
            const window1Y = window1.centerY - window.screenY;

            const window2X = window2.centerX - window.screenX;
            const window2Y = window2.centerY - window.screenY;

            drawLine(window1X, window1Y, window2X, window2Y);
        }
    }

    // Draw circle on top after
    for (const uuid in windows) {
        drawCircle(
            windows[uuid].centerX - window.screenX,
            windows[uuid].centerY - window.screenY
        );
    }

    localStorage.setItem("windows", JSON.stringify(windows));
    requestAnimationFrame(animate);
}

animate();
