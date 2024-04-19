const BLACK = "#141414";

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();

canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var gridsize = parseInt(document.getElementById("gridsize").value, 10);

var gridWidth = Math.floor(width/gridsize) + 1;
var gridHeight = Math.floor(height/gridsize) + 1;

var gridvalues = [];
var shapes = [];
var threshold = parseInt(document.getElementById("threshold").value, 10);
var isRunning = true;
var screenoffsetx = width * .9;
var screenoffsety = height * .9;
const tickrate = 50;
const north = 0;
const east = 1;
const south = 2;
const west = 3;

// Each corner is represented as the bit in the given position. 0b1234 converted to decimal
// Each case where an edge is to be drawn is given as [from, to] with
// the possibility of multiple edges
// 1---N---2
// -       -
// W       E
// -       -
// 4---S---3


const arrangements = {
    1: [[south, west]],
    2: [[east, south]],
    4: [[north, east]],
    8: [[north, west]],
    12: [[east, west]],
    10: [[north, east], [south, west]],
    9: [[north, south]],
    6: [[north, south]],
    5: [[north, west],[east, south]],
    3: [[east, west]],
    14: [[south, west]],
    13: [[east, south]],
    11: [[north, east]],
    7: [[north, west]]
};

class Square {

    constructor() {
        this.sidelength = randint(25, 75);
        this.x = randint(Math.floor(this.sidelength/2)+screenoffsetx, width-Math.floor(this.sidelength/2)-screenoffsetx);
        this.y = randint(Math.floor(this.sidelength/2)+screenoffsety, height-Math.floor(this.sidelength/2)-screenoffsety);
        this.dx = randint(-50, 50)/tickrate;
        this.dy = randint(-50, 50)/tickrate;
    }

    update() {
        if (this.x + this.dx + this.sidelength/2 > width || this.x + this.dx - this.sidelength/2 < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy + this.sidelength/2 > height || this.y + this.dy - this.sidelength/2 < 0) {
            this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;
    }

    calculateImplicitFunction(x, y) {
        let diff = Math.abs((x-this.x)+(y-this.y))+Math.abs((x-this.x)-(y-this.y));
        if (diff == 0) {
            return this.sidelength/0.000001;
        }
        else {
            return this.sidelength/diff;
        }
    }
}

class Circle {

    constructor() {
        this.r = randint(25, 75);
        this.x = randint(this.r+screenoffsetx, width-this.r-screenoffsetx);
        this.y = randint(this.r+screenoffsety, width-this.r-screenoffsety);
        this.dx = randint(-50, 50)/tickrate;
        this.dy = randint(-50, 50)/tickrate;
    }

    update() {
        if (this.x + this.dx + this.r > width || this.x + this.dx - this.r < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy + this.r > height || this.y + this.dy - this.r < 0) {
            this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;
    }

    calculateImplicitFunction(x, y) {
        let diff = Math.pow((x - this.x), 2) + Math.pow((y - this.y), 2);
        if (diff == 0) {
            return (Math.pow(this.r, 2))/0.000001;
        }
        else {
            return (Math.pow(this.r, 2))/diff;
        }
    }
}

window.addEventListener('resize', event => {
    resetSim();
});

function drawLine(p1, p2, w) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = w;
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    ctx.closePath();
}

function toggleIsRunning() {
    isRunning = !isRunning;
    if (isRunning) {
        document.getElementById("isrunningtoggle").textContent = "Pause Simulation";
    }
    else {
        document.getElementById("isrunningtoggle").textContent = "Play Simulation";
    }
}

// X_i = A_i + (B_i - A_i)((1-f(A))/(f(B)-f(A)))
function interpolate(r1, c1, r2, c2, mode) {
    let ai, bi;
    if (mode == "x") {
        ai = c1*gridsize;
        bi = c2*gridsize;
    }
    else {
        ai = r1*gridsize;
        bi = r2*gridsize;
    }
    let xi = ai+(bi-ai)*((threshold-gridvalues[r1][c1])/(gridvalues[r2][c2]-gridvalues[r1][c1]));
    return xi;   
}

function getValues() {
    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            let sum = 0;
            shapes.forEach(shape => {
                let implicit = shape.calculateImplicitFunction(c*gridsize, r*gridsize);
                sum += implicit;
            });
            gridvalues[r][c] = sum;
        }
    }
}

function marchSquares() {
    getValues();
    for (let r = 0; r < gridvalues.length - 1; r++) {
        for (let c = 0; c < gridvalues[0].length - 1; c++) {
            let bits = 0;
            bits += gridvalues[r][c] >= threshold ? 8 : 0;
            bits += gridvalues[r][c+1] >= threshold ? 4 : 0;
            bits += gridvalues[r+1][c+1] >= threshold ? 2 : 0;
            bits += gridvalues[r+1][c] >= threshold ? 1 : 0;
            if (0 < bits && bits < 15) {
                let edges = arrangements[bits];
                edges.forEach(edge => {
                    let start = [];
                    let end = [];
                    switch(edge[0]) {
                        case 0: start = [interpolate(r, c, r, c+1, "x"), r*gridsize]; break;
                        case 1: start = [c*gridsize+gridsize, interpolate(r, c+1, r+1, c+1, "y")]; break;
                        case 2: start = [interpolate(r+1, c+1, r+1, c, "x"), r*gridsize+gridsize]; break;
                    }
                    switch(edge[1]) {
                        case 1: end = [c*gridsize+gridsize, interpolate(r, c+1, r+1, c+1, "y")]; break;
                        case 2: end = [interpolate(r+1, c+1, r+1, c, "x"), r*gridsize+gridsize]; break;
                        case 3: end = [c*gridsize,interpolate(r+1, c, r, c, "y")]; break;
                    }
                    drawLine(start, end, 1);
                });
            }
        }
    }
}

function updateShapes() {
    shapes.forEach(shape => {
        shape.update();
    });
}


function randint(min, max) {
    return Math.floor(Math.random() * (max+1-min) + min);
}
    

function resetSim() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    threshold = parseFloat(document.getElementById("threshold").value, 10);

    gridsize = parseInt(document.getElementById("gridsize").value, 10);
    gridWidth = Math.floor(width/gridsize) + 1;
    gridHeight = Math.floor(height/gridsize) + 1;

    screenoffsetx = width * .9;
    screenoffsety = height * .9;

    gridvalues = [];
    for (let i = 0; i < gridHeight; i++) {
        let tmp = [];
        for (let i = 0; i < gridWidth; i++) {
            tmp.push([]);
        }
        gridvalues.push(tmp);
    }
    
    shapes = [new Circle(),
              new Circle(),
              new Circle(),
              new Circle(),
              new Circle(),
              new Circle(),
              new Square()];

    marchSquares();
}

function updateAndDraw() {
    if (isRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        marchSquares();
        updateShapes();
    }
    requestAnimationFrame(updateAndDraw);
}

resetSim();
updateAndDraw();