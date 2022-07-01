const DELTA = 0.1;
const COORD_LIMIT = 3.17;
var line = [];
const GRAPH_LOWER = 50;
const GRAPH_UPPER = 550;

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

    line(ctx, xI, xF, yI, yF, width=3) {
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

class Pendulum {
    constructor(dampingConstant, length, initialAngle, initialVelocity) {
        var gravity = 9.8;
        this.c = dampingConstant;
        this.l = gravity/length;
        this.angle = initialAngle;
        this.vel = initialVelocity;
        this.acc = 0;
    }

    update() {
        this.acc = -1 * this.l * Math.sin(this.angle) - this.c * this.vel;
        this.vel += (DELTA * this.acc);
        this.angle += (DELTA * this.vel);
        if (this.angle < -1 * Math.PI) {
            this.angle += (2 * Math.PI);
            line.push("JUMP");
        } else if (this.angle > Math.PI) {
            this.angle -= (2 * Math.PI);
            line.push("JUMP");
        }
        
    }

    getVelocity() {
        return this.vel;
    }

    getAngle() {
        return this.angle;
    }

    toString() {
        return ("Pendulum with damping: " + this.c.toString() + "; lamdba: " + this.l.toString() + 
            "; angle: " + this.angle.toString() + "; and velocity: " + this.vel.toString());
    }
}

function drawAxes(ctx, stateSpace) {
    ctx.strokeStyle = 'black';
    stateSpace.line(ctx, 0, 0, 0, 100);
    stateSpace.line(ctx, 100, 0, 0, 0);
    stateSpace.line(ctx, 100, 0, 100, 100);
    stateSpace.line(ctx, 100, 100, 0, 100);
}

function drawTicks(ctx, stateSpace) {
    
    unitSize = Math.round(100 / (COORD_LIMIT * 2));
    majorTicks = range(50 - 3*unitSize, 100, unitSize);
    ctx.font = "26px Alegreya";

    for (var i = 0; i < majorTicks.length; i++) {
        val = majorTicks[i];
        stateSpace.line(ctx, val, val, 103, -3, 2);
        stateSpace.line(ctx, 103, -3, val, val, 2);
        ctx.fillText(i-3, ...stateSpace.point(val-1, -5));
        ctx.fillText(i-3, ...stateSpace.point(val-1, 108));
        ctx.fillText(3-i, ...stateSpace.point(-8, val+2));
        ctx.fillText(3-i, ...stateSpace.point(105, val+2));
    }
    
}
function drawGridLines(ctx, stateSpace) {

    const lineWidth = 0.5;
    ctx.strokeStyle = "#aaa";
    
    unitSize = Math.round(100 / (COORD_LIMIT * 4));
    majorTicks = range(50 - 6*unitSize, 100, unitSize);

    for (var i = 0; i < majorTicks.length; i++) {
        val = majorTicks[i];
        stateSpace.line(ctx, val, val, 100, 0, lineWidth);
        stateSpace.line(ctx, 100, 0, val, val, lineWidth);
    }

    ctx.strokeStyle = "#aaa";
    stateSpace.line(ctx, 50, 50, 100, 0, 1);
    stateSpace.line(ctx, 100, 0, 50, 50, 1);
    
}

function drawLine(ctx) {
    if (!line.length) {
        return;
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.moveTo(...line[0]);
    for (i=1; i < line.length; i++) {
        nextCoord = line[i]
        if (nextCoord == "JUMP") {
            ctx.stroke();
            ctx.beginPath();
            continue;
        }
        ctx.lineTo(...nextCoord);
    }
    ctx.stroke();

}


function setUpStateSpace(ctx) {
    stateSpace = new Frame(GRAPH_LOWER, GRAPH_UPPER, GRAPH_LOWER, GRAPH_UPPER);
    ctx.strokeStyle = '#333';
    drawTicks(ctx, stateSpace);
    ctx.fillStyle = '#fff';
    ctx.fillRect(...stateSpace.point(0, 0), ...stateSpace.offsetPoint(100, 100));
    drawGridLines(ctx, stateSpace);
    drawAxes(ctx, stateSpace);
    drawLine(ctx);
    return stateSpace;
}


function writePendulum(ctx, angle) {
    pendulumSpace = new Frame(800, 1200, 100, 500);
    xCoord = Math.round(50 + 50 * Math.sin(angle));
    yCoord = Math.round(50 + 50 * Math.cos(angle));
    pendulumSpace.line(ctx, 50, xCoord, 50, yCoord, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(...pendulumSpace.point(xCoord, yCoord), 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#057aff';
    ctx.fill();

}

function xToPercent(coord) {
    return (((coord * 50 / COORD_LIMIT) + 1) + 50);
}
function yToPercent(coord) {
    return (50 - ((coord * 50 / COORD_LIMIT) + 1));
}

function writeState(ctx, stateSpace, angle, velocity) {

    const anglePercent = xToPercent(angle);
    const velPercent = yToPercent(velocity);

    
    if (anglePercent < 0 || anglePercent > 100 || velPercent < 0 || velPercent > 100) {
        line.push("JUMP");
    } else {
        newState = stateSpace.point(anglePercent, velPercent);
        line.push(newState);
        ctx.beginPath();
        ctx.arc(...newState, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#057aff';
        ctx.fill();
    }
    
}

function update(c, ctx, pendulum) {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#000';
    stateSpace = setUpStateSpace(ctx);
    writePendulum(ctx, pendulum.getAngle());
    pendulum.update();
    writeState(ctx, stateSpace, pendulum.getAngle(), pendulum.getVelocity());

    
}

function getPhysicalProperties() {
    damping = parseFloat(document.getElementById("damping").value);
    length = parseFloat(document.getElementById("length").value);
    return [damping, length];
}

function getInitStateFromInput() {
    initAngle = parseFloat(document.getElementById("initAngle").value);
    initVel = parseFloat(document.getElementById("initVel").value);
    return [initAngle, initVel];
}

var pendInterval = null;

function newPendulum(c, ctx) {
    clearInterval(pendInterval);
    line = [];
    [damping, length] = getPhysicalProperties();
    [initAngle, initVel] = getInitStateFromInput();
    pendulum = new Pendulum(damping, length, initAngle, initVel);
    pendInterval = setInterval(function() {update(c, ctx, pendulum)}, 25);
}

function getGraphPercentX(coord) {
    if (coord <= GRAPH_LOWER || coord >= GRAPH_UPPER) {
        return 0;
    } else {
        return ((coord - GRAPH_LOWER) * 100 / (GRAPH_UPPER - GRAPH_LOWER));
    }
}

function getGraphPercentY(coord) {
    if (coord <= GRAPH_LOWER || coord >= GRAPH_UPPER) {
        return 0;
    } else {
        return (100 - ((coord - GRAPH_LOWER) * 100 / (GRAPH_UPPER - GRAPH_LOWER)));
    }
}

function clickPendulum(e, c, ctx) {
    let rect = c.getBoundingClientRect();
    let x = (e.clientX - rect.left) * 2;
    let y = (e.clientY - rect.top) * 2;
    
    [xPercent, yPercent] = [getGraphPercentX(x), getGraphPercentY(y)];
    if (!xPercent || !yPercent) {
        return;
    }
    coordScale = createScale(-1 * COORD_LIMIT, COORD_LIMIT);

    [initAngle, initVel] = [coordScale(xPercent), coordScale(yPercent)];

    document.getElementById("initAngle").value = initAngle;
    document.getElementById("angle_out").value = initAngle.toFixed(2);
    document.getElementById("initVel").value = initVel;
    document.getElementById("vel_out").value = initVel.toFixed(2);

    newPendulum(c, ctx);

}



$(document).ready( function() {
    const c = document.getElementById("myCanvas");
    c.width = 1280;
    c.height = 600;
    const ctx = c.getContext('2d');
    const defaultPendulum = new Pendulum(0.5, 5, 2, 2);
    pendInterval = setInterval(function() {update(c, ctx, defaultPendulum)}, 25);
    // setTimeout(function() {newPendulum(c, ctx, pendInterval)}, 2000);
    c.addEventListener("mousedown", function(e) {clickPendulum(e, c, ctx);});
    refreshBtn = document.getElementById("refresh");
    refreshBtn.addEventListener("click", function() {newPendulum(c, ctx);});
});