const SESSION_UUID = (() => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
})();

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

function animate() {
    const windows = JSON.parse(localStorage.getItem("windows"));

    // Update the session
    const { centerX, centerY } = calculateScreenCenter();
    windows[SESSION_UUID] = {
        time: Date.now(),
        centerX,
        centerY,
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

    localStorage.setItem("windows", JSON.stringify(windows));
    requestAnimationFrame(animate);
}

animate();
