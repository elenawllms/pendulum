
function createScale(initialVal, finalVal) {
    return (percent) => (initialVal + (percent / 100 ) * (finalVal - initialVal));
}

function spaceScale(xInitVal, xFinalVal, yInitVal, yFinalVal) {
    return ([xPercent, yPercent]) => [createScale(xInitVal, xFinalVal)(xPercent), createScale(yInitVal, yFinalVal)(yPercent)];
}

const range = (start, end, step = 1) => {
    let output = [];
    if (typeof end === 'undefined') {
      end = start;
      start = 0;
    }
    for (let i = start; i < end; i += step) {
      output.push(i);
    }
    return output;
  };

class Frame {
    constructor(xI, xF, yI, yF) {
        this.left = xI;
        this.right = xF;
        this.top = yI;
        this.bottom = yF;

        this.xScale = createScale(xI, xF);
        this.yScale = createScale(yI, yF);
    }

    point(xPercent, yPercent) {
        return [this.xScale(xPercent), this.yScale(yPercent)];
    }
    
    offsetPoint(xPercent, yPercent) {
        return [this.xScale(xPercent) - this.left, this.yScale(yPercent) - this.top]
    }

    line(ctx, xI, xF, yI, yF, width=2) {
        ctx.beginPath();
        ctx.moveTo(...this.point(xI, yI));
        ctx.lineTo(...this.point(xF, yF));
        ctx.lineWidth = width;
        ctx.stroke();
    }

    get height() {
        return (this.bottom - this.top);
    }

    get width() {
        return (this.right - this.left);
    }
}

function drawAxes(ctx, stateSpace) {
    stateSpace.line(ctx, 0, 0, 0, 100);
    stateSpace.line(ctx, 100, 0, 0, 0);
    stateSpace.line(ctx, 100, 0, 100, 100);
    stateSpace.line(ctx, 100, 100, 0, 100);
}

function drawTicks(ctx, stateSpace) {
    
    unitSize = Math.round(100 / 7.5);
    majorTicks = range(50 - 3*unitSize, 100, unitSize);
    console.log(majorTicks);
    ctx.font = "10px Helvetica";

    for (var i = 0; i < majorTicks.length; i++) {
        val = majorTicks[i];
        stateSpace.line(ctx, val, val, 103, -3, 2);
        stateSpace.line(ctx, 103, -3, val, val, 2);
        ctx.fillText(i-3, ...stateSpace.point(val-1, -5));
        ctx.fillText(i-3, ...stateSpace.point(val-1, 108));
        ctx.fillText(i-3, ...stateSpace.point(-8, val+2));
        ctx.fillText(i-3, ...stateSpace.point(105, val+2));
    }
    
}


function setUpStateSpace(ctx) {
    stateSpace = new Frame(50, 310, 50, 310);
    ctx.strokeStyle = '#333';
    drawTicks(ctx, stateSpace);
    ctx.fillStyle = '#eee';
    ctx.fillRect(...stateSpace.point(0, 0), ...stateSpace.offsetPoint(100, 100));
    drawAxes(ctx, stateSpace);

}


$(document).ready( function() {
    const c = document.getElementById("myCanvas");
    c.width = 640;
    c.height = 360;
    const ctx = c.getContext('2d');
    setUpStateSpace(ctx);
});