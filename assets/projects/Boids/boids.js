const BLACK = "#141414";
const WHITE = "#F7F7F7";
const GREEN = "#14F714";
const RED = "#F71414";
const BLUE = "#1414F7";
var NUM_BOIDS = 100; // 
var VELOCITY_LIMIT = 3;
const SEPERATION_RANGE = 25;
const ALIGNMENT_RANGE = 50;
const COHESION_RANGE = 50;
var SEPERATION_CONSTANT = 2.0;
var ALIGNMENT_CONSTANT = 1.0;
var COHESION_CONSTANT = 1.0;
var MOUSE_AVOID_CONSTANT = -5.0;
const MOUSE_AVOID_RANGE = 100;
const FORCE_LIMIT = 0.05;
const RANDOM_TURN_LIMIT = 0.005;
const OFFSET_CONSTANT = 0.05;

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;
var screen_offset_x = Math.floor(width * OFFSET_CONSTANT);
var screen_offset_y = Math.floor(height * OFFSET_CONSTANT);
var mousePos = new Vector2(0, 0);

var flocks = [];
var mouseAvoid = false;

const randint = (min, max) => { return Math.floor(Math.random() * (max+1-min) + min); }
const randfloat = (min, max) => { return Math.random() * (max-min) + min; }

class Boid {

    constructor(position) {
        this.pos = position;
        this.vel = new Vector2(1, 0).rotate(randfloat(0.0, 2*Math.PI));
        this.accel = new Vector2(0, 0);
        // Defined pointing to 0 radians
        this.tPoints = [new Vector2(6.0, 0), new Vector2(-4, -4), new Vector2(-4, 4)];
    }

    guide(flock) {
        this.accel = new Vector2(0, 0);
        let sepSum = new Vector2(0, 0);
        let alignSum = new Vector2(0, 0);
        let cohSum = new Vector2(0, 0);
        let nInSepRange = 0;
        let nInAlignRange = 0;
        let nInCohRange = 0;

        flock.forEach(boid => {
            let dist = this.pos.sub(boid.pos).length();
            if (dist > 0 && dist < SEPERATION_RANGE) {
                sepSum = sepSum.add(this.pos.sub(boid.pos).normalize().div(dist));
                nInSepRange++;
            }
            if (dist > 0 && dist < ALIGNMENT_RANGE) {
                alignSum = alignSum.add(boid.vel);
                nInAlignRange++;
            }
            if (dist > 0 && dist < COHESION_RANGE) {
                cohSum = cohSum.add(boid.pos);
                nInCohRange++;
            }
        });
        if (nInSepRange > 0) {
            this.target(sepSum, SEPERATION_CONSTANT);
        }
        if (nInAlignRange > 0) {
            this.target(alignSum, ALIGNMENT_CONSTANT);
        }
        if (nInCohRange > 0) {
            cohSum = cohSum.div(nInCohRange).sub(this.pos);
            this.target(cohSum, COHESION_CONSTANT);
        }
        if (mouseAvoid) {
            let mouseDiff = mousePos.sub(this.pos);
            if (mouseDiff.length() < MOUSE_AVOID_RANGE) {
                this.target(mouseDiff, MOUSE_AVOID_CONSTANT);
            }
        }
    }

    target(vector, constant) {
        this.accel = this.accel.add(vector.normalize().mul(VELOCITY_LIMIT).sub(this.vel).limit(FORCE_LIMIT).mul(constant));
    }

    update() {
        let projectedVel = this.vel.add(this.accel.rotate(randfloat(-RANDOM_TURN_LIMIT, RANDOM_TURN_LIMIT))).limit(VELOCITY_LIMIT);
        let projectedPos = this.pos.add(projectedVel);
        if (projectedPos.x < screen_offset_x && this.accel.x < 0 || projectedPos.x > width - screen_offset_x && this.accel.x > 0) {
            this.accel.x *= -1;
        }
        if (projectedPos.y < screen_offset_y && this.accel.y < 0 || projectedPos.y > height - screen_offset_y && this.accel.y > 0) {
            this.accel.y *= -1;
        }
        this.vel = this.vel.add(this.accel.rotate(randfloat(-RANDOM_TURN_LIMIT, RANDOM_TURN_LIMIT))).limit(VELOCITY_LIMIT);
        this.pos.x = (this.pos.x + this.vel.x) % width;
        this.pos.y = (this.pos.y + this.vel.y) % height;
    }

    display(color) {
        let heading = this.vel.angle();
        let tPoints = [];
        for (let i = 0; i < this.tPoints.length; i++) {
            tPoints.push(this.tPoints[i].rotate(heading).add(this.pos));
        }
        drawTriangle(tPoints, color);
    }
}

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;
}

canvas.addEventListener('mousemove', event => {
    getMousePos(event);
});

canvas.addEventListener('mousedown', event => {
    if (event.button === 0) {
        console.log("Left mouse clicked");
        mouseAvoid = true;
    }
});

canvas.addEventListener('mouseup', event => {
    if (event.button === 0) {
        console.log("Left mouse released");
        mouseAvoid = false;
    }
});

window.addEventListener('resize', event => {
    resetSim();
});

function updateNumBoids() {
    NUM_BOIDS = document.getElementById("numBoids").value;
    resetSim()
}

function updateSepConstant() {
    SEPERATION_CONSTANT = document.getElementById("sepConstant").value / 10;
}

function updateAlignConstant() {
    ALIGNMENT_CONSTANT = document.getElementById("alignConstant").value / 10;
}

function updateCohConstant() {
    COHESION_CONSTANT = document.getElementById("cohConstant").value / 10;
}

function updateMouseAvoidConstant() {
    MOUSE_AVOID_CONSTANT = document.getElementById("mouseAvoidConstant").value / 10 * -1;
}

function drawTriangle(points, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.fill();
    ctx.closePath();
}

function resetSim() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;
    screen_offset_x = Math.floor(width * OFFSET_CONSTANT);
    screen_offset_y = Math.floor(height * OFFSET_CONSTANT);

    flocks = [];
    let temparr = [];
    for (let i = 0; i < NUM_BOIDS; i++) {
        temparr.push(new Boid(new Vector2(randint(screen_offset_x, width - screen_offset_x), randint(screen_offset_y, height - screen_offset_y))))
    }

    if(document.getElementById("simType").value == "one") {
        flocks.push([BLACK, temparr]);
    }
    else if(document.getElementById("simType").value == "three") {
        flocks.push([RED, temparr.slice(0, Math.floor(temparr.length / 3))]);
        flocks.push([BLUE, temparr.slice(Math.floor(temparr.length / 3), Math.floor(temparr.length / 3) * 2)]);
        flocks.push([GREEN, temparr.slice(Math.floor(temparr.length / 3) * 2, temparr.length)]);
    }
}

function mainloop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flocks.forEach(flock => {
        flock[1].forEach(boid => {
            boid.guide(flock[1]);
            boid.update();
            boid.display(flock[0])
        });
    });
    requestAnimationFrame(mainloop);
}
    
resetSim();
mainloop();