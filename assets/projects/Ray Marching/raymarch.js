const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;
var screen_offset_x = width*0.9;
var screen_offset_y = height*0.9;

var collisions = [];

var mousePos = [Math.floor(width/2), Math.floor(height/2)];

var angle = 0;
var objects = [];
var update = true;

const MAX_STEPS = 100;
const MAX_COLLISIONS = 4000;
const BLACK = "#141414";
const WHITE = "#F7F7F7";
const ANGLE_INTERVAL = 0.001;
const RED = "#FF2978";
const GREEN = "#B4F4BB";
const COLLISION_THESHOLD = 1;
const OBJECT_COUNT = 15;

const clamp = (x, min, max) => { return Math.min(max, Math.max(x, min)); }
const dot = (p1, p2) => { return p1[0]*p2[0] + p1[1]*p2[1]; }
const vlen = (vector) => { return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2)); }
const randint = (min, max) => { return Math.floor(Math.random() * (max+1-min) + min); }

class Circle {
    constructor(x, y, radius) {
        this.position = [x, y];
        this.radius = radius;
    }

    SignedDistance(a) {
        let distance = vlen([(a[0]-this.position[0]), (a[1]-this.position[1])]);
        return distance - this.radius;
    }
}

class Square {
    constructor(x, y, radius) {
        this.position = [x, y];
        this.radius = radius;
    }

    SignedDistance(a) {
        a = [Math.abs(a[0]-this.position[0]), Math.abs(a[1]-this.position[1])];
        return vlen([Math.max(a[0]-this.radius, 0), Math.max(a[1]-this.radius, 0)]);
    }
}
    
class Triangle {
    constructor(x, y, radius) {
        this.position = [x, y];
        this.radius = radius;
    }

    SignedDistance(a) {
        a = [a[0]-this.position[0], -(a[1]-this.position[1])];
        let k = Math.sqrt(3.0);
        a[0] = Math.abs(a[0]) - this.radius;
        a[1] = a[1] + this.radius/k;
        if (a[0]+k*a[1] > 0.0) { a = [(a[0]-k*a[1])/2, (-k*a[0]-a[1])/2.0]; }
        a[0] -= clamp(a[0], -2.0*this.radius, 0.0);
        return a[1] < 0.0 ? -vlen(a)*-1 : a[1] == 0 ? 0.0 : -vlen(a);
    }
}
    
class Pentagon {
    constructor(x, y, radius) {
        this.position = [x, y];
        this.radius = radius;
    }

    SignedDistance(a) {
        a = [Math.abs(a[0]-this.position[0]), (a[1]-this.position[1])];
        let k = [0.809016994, 0.587785252, 0.726542528];
        let scalar = 2.0*Math.min(dot([-k[0], k[1]], a), 0.0);
        a[0] -= scalar*-k[0];
        a[1] -= scalar*k[1];
        scalar = 2.0*Math.min(dot([k[0], k[1]], a), 0.0);
        a[0] -= scalar*k[0];
        a[1] -= scalar*k[1];
        a[0] -= clamp(a[0], -this.radius*k[2], this.radius*k[2]);
        a[1] -= this.radius;
        return a[1] < 0.0 ? vlen(a)*-1 : a[1] == 0.0 ? 0.0 : vlen(a);
    }
}
    
class Hexagram {
    constructor(x, y, radius) {
        this.position = [x, y];
        this.radius = radius;
    }

    SignedDistance(a) {
        a = [Math.abs(a[0]-this.position[0]), Math.abs(a[1]-this.position[1])];
        let k = [-0.5, 0.8660254038, 0.5773502692, 1.7320508076];
        let scalar = 2.0*Math.min(dot([k[0], k[1]], a), 0.0);
        a[0] -= scalar*k[0];
        a[1] -= scalar*k[1];
        scalar = 2.0*Math.min(dot([k[1], k[0]], a), 0.0);
        a[0] -= scalar*k[1];
        a[1] -= scalar*k[0];
        a[0] -= clamp(a[0], this.radius*k[2], this.radius*k[3]);
        a[1] -= this.radius;
        return a[1] < 0.0 ? vlen(a)*-1 : a[1] == 0.0 ? 0.0 : vlen(a);
    }
}

canvas.addEventListener('mousemove', event => {
    update = true;
    getMousePos(event);
});

canvas.addEventListener('wheel', event => {
    angle += event.deltaY * ANGLE_INTERVAL;
    update = true;
    event.preventDefault();
});

window.addEventListener('resize', event => {
    reset();
});

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top; 
    mousePos = [x, y];
}

function drawCircle(color, p, r) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fill()
    ctx.closePath();
}

function drawHollowCircle(color, p, r) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.arc(p[0],p[1],r,0,Math.PI * 2);
    ctx.stroke()
    ctx.closePath();
}

function drawLine(color, p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    ctx.closePath();
}

function place_objects() {
    objects = [];
    for (let i = 0; i <= OBJECT_COUNT; i += 5) {
        let c = new Circle(randint(screen_offset_x, width - screen_offset_x), randint(screen_offset_y, height - screen_offset_y), randint(20, 80));
        let s = new Square(randint(screen_offset_x, width - screen_offset_x), randint(screen_offset_y, height - screen_offset_y), randint(20, 80));
        let e = new Triangle(randint(screen_offset_x, width - screen_offset_x), randint(screen_offset_y, height - screen_offset_y), randint(20, 80));
        let p = new Pentagon(randint(screen_offset_x, width - screen_offset_x), randint(screen_offset_y, height - screen_offset_y), randint(20, 80));
        let x = new Hexagram(randint(screen_offset_x, width - screen_offset_x), randint(screen_offset_y, height - screen_offset_y), randint(20, 80));
        objects.push(c);
        objects.push(s);
        objects.push(e);
        objects.push(p);
        objects.push(x);
    }
}

function march() {
    let counter = 0;
    let current_position = [...mousePos];
    drawCircle(RED, mousePos, 3);
    while (counter < MAX_STEPS) {
        let record = Infinity;
        for (let i = 0; i < objects.length; i++) {
            let distance = objects[i].SignedDistance(current_position);
            if (distance < record) {
                record = distance;
            }
        }

        if (record < COLLISION_THESHOLD) {
            collisions.splice(0, 0, current_position);
            break;
        }

        let x_step = current_position[0] + Math.cos(angle) * record;
        let y_step = current_position[1] + Math.sin(angle) * record;

        drawHollowCircle(GREEN, current_position, Math.abs(record));
        drawLine(BLACK, current_position, [x_step, y_step]);

        current_position[0] = x_step;
        current_position[1] = y_step;

        if ((x_step < 0 || x_step > width || y_step < 0 || y_step > height) || (current_position[0] < 0 || current_position[0] > width || current_position[1] < 0 || current_position[1] > height)) {
            break;
        }
        counter++;
    }
}

function mainLoop() {
    if (update) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < collisions.length; i++) {
            drawCircle(BLACK, collisions[i], 2);
        }
        if (collisions.length > MAX_COLLISIONS) {
            collisions.pop();
        }
        march();
        update = false;
    }
    requestAnimationFrame(mainLoop)
}

function reset() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;
    screen_offset_x = width*0.9;
    screen_offset_y = height*0.9;
    collisions = [];
    angle = 0;
    objects = [];
    update = true;

    place_objects();
}

reset();
mainLoop();