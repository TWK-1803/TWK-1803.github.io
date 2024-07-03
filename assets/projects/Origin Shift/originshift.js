const BLACK = "#141414";
const GREEN = "#14F714";
const RED = "#F71414";
const WHITE = "#FFFFFFFF";

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var screenOffset = width*0.02;

var drawWalls = document.getElementById("walls").checked;
var drawPaths = document.getElementById("paths").checked;
var drawSolution = document.getElementById("solution").checked;
var drawOrigin = document.getElementById("origin").checked;

var gridxScale = 0;
var gridyScale = 0;
var numIters = 0;

var gridWidth = 50;
var gridHeight = 50;

var maze;

class Maze {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.origin = [height - 1, width - 1];
        this.start = [0, randint(0, width - 1)];
        this.end  = [height - 1, randint(0, width - 1)];
        this.grid = [];
        for (let j = 0; j < height; j++) {
            let tmp = [];
            for (let i = 0; i < width; i++) {
                if (i < width - 1) {
                    tmp.push([j, i+1]);
                } 
                else {
                    tmp.push([j+1, i]);
                }
            }
            this.grid.push(tmp);
        }
        this.grid[height - 1][width - 1] = [];
        this.validDirections = [[-1, 0], [0, -1]];
        this.generateSolution();
    }

    originShift() {
        let previousOrigin = [...this.origin];
        this.validDirections = [];
        if (previousOrigin[0] < this.height - 1) {
            this.validDirections.push([1, 0]);
        }
        if (previousOrigin[0] > 0) {
            this.validDirections.push([-1, 0]);
        }
        if (previousOrigin[1] < this.width - 1) {
            this.validDirections.push([0, 1]);
        }
        if (previousOrigin[1] > 0) {
            this.validDirections.push([0, -1]);
        }

        let direction = choice(this.validDirections);
        this.origin[0] += direction[0];
        this.origin[1] += direction[1];
        this.grid[previousOrigin[0]][previousOrigin[1]] = [this.origin[0], this.origin[1]];
        this.grid[this.origin[0]][this.origin[1]] = [];
    }
        
    generateSolution() {
        let startsolutionpath = [];
        let y = this.start[0];
        let x = this.start[1];
        while (!arrEqual([y, x], this.origin)) {
            startsolutionpath.push([y, x]);
            let tmpy = y;
            let tmpx = x
            y = this.grid[tmpy][tmpx][0];
            x = this.grid[tmpy][tmpx][1];
        }
        startsolutionpath.push(this.origin);
        let endsolutionpath = [];
        y = this.end[0];
        x = this.end[1];
        while (!arrEqual([y, x], this.origin)) {
            endsolutionpath.push([y, x]);
            let tmpy = y;
            let tmpx = x
            y = this.grid[tmpy][tmpx][0];
            x = this.grid[tmpy][tmpx][1];
            if (!arrEqual([y, x], this.origin) && includesArray(startsolutionpath, [y, x])) {
                let ind = indexOfArray(startsolutionpath, [y, x]);
                endsolutionpath.push([y, x]);
                this.solutionpath = startsolutionpath.splice(0,ind).concat(endsolutionpath.reverse());
                return;
            }
        }
        this.solutionpath = startsolutionpath.concat(endsolutionpath.reverse());
    }
}

function randint(min, max) {
    return Math.floor(Math.random() * (max+1-min) + min);
}

function choice(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
}

function arrEqual (a, b) {
    return a.length === b.length &&
    a.every((element, index) => element === b[index]);
}

function includesArray(array, item) {
    for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) === JSON.stringify(item)) {
            return true;
        }
    }
    return false;
}

function indexOfArray(array, item) {
    for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) === JSON.stringify(item)) {
            return i;
        }
    }
    return -1;
}

function originShift() {
    maze.originShift();
    maze.generateSolution();
}

function widthChange() {
    t = document.getElementById("width").value;

    if (t == ""){
        width = 5;
        document.getElementById("width").value = 5;
    }
    else if (t < 5){
        width = 5;
        document.getElementById("width").value = 5;
    }

    else if (t > 100){
        width = 100;
        document.getElementById("width").value = 100;
    }
    else{
        width = parseInt(t, 10);
    }
}

function heightChange() {
    t = document.getElementById("height").value;

    if (t == ""){
        height = 5;
        document.getElementById("height").value = 5;
    }
    else if (t < 5){
        height = 5;
        document.getElementById("height").value = 5;
    }

    else if (t > 100){
        height = 100;
        document.getElementById("height").value = 100;
    }
    else{
        height = parseInt(t, 10);
    }
}

function drawWallsChange(){
    drawWalls = !drawWalls;
}

function drawPathsChange(){
    drawPaths = !drawPaths;
}

function drawSolutionChange(){
    drawSolution = !drawSolution;
}

function drawOriginChange(){
    drawOrigin = !drawOrigin;
}

function drawLine(p1, p2, w, color) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    ctx.closePath();
}

function drawCircle(p, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
    ctx.fill(),
    ctx.closePath();
}

window.addEventListener('resize', event => {
    resetMaze();
});

function resetMaze() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    screenOffset = width*0.02;

    drawWalls = document.getElementById("walls").checked;
    drawPaths = document.getElementById("paths").checked;
    drawSolution = document.getElementById("solution").checked;
    drawOrigin = document.getElementById("origin").checked;

    gridWidth = parseInt(document.getElementById("width").value, 10);
    gridHeight = parseInt(document.getElementById("height").value, 10);

    gridxScale = (width - screenOffset*2) / gridWidth
    gridyScale = (height - screenOffset*2) / gridHeight
    numIters = gridWidth*gridHeight*35;

    maze = new Maze(gridWidth, gridHeight);

    for (let i = 0; i < numIters; i++) {
        maze.originShift();
    }
    maze.generateSolution()
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (drawOrigin) {
        drawCircle([maze.origin[1]*gridxScale+screenOffset+Math.floor(gridxScale/2), maze.origin[0]*gridyScale+screenOffset+Math.floor(gridyScale/2), 3], BLACK);
    }

    if (drawPaths) { 
        for (let i = 0; i < maze.grid.length; i++) {
            for (let j = 0; j < maze.grid[i].length; j++) {
                if (maze.grid[i][j].length == 0) 
                    continue
                else if (maze.grid[i][j][0] == i-1)
                    drawLine([j*gridxScale+screenOffset+Math.floor(gridxScale/2), i*gridyScale+screenOffset+Math.floor(gridyScale/2)], [(j)*gridxScale+screenOffset+Math.floor(gridxScale/2), (i-1)*gridyScale+screenOffset+Math.floor(gridyScale/2)], 1, GREEN);
                else if (maze.grid[i][j][0] == i+1)
                    drawLine([j*gridxScale+screenOffset+Math.floor(gridxScale/2), i*gridyScale+screenOffset+Math.floor(gridyScale/2)], [(j)*gridxScale+screenOffset+Math.floor(gridxScale/2), (i+1)*gridyScale+screenOffset+Math.floor(gridyScale/2)], 1, GREEN);
                else if (maze.grid[i][j][1] == j-1)
                    drawLine([j*gridxScale+screenOffset+Math.floor(gridxScale/2), i*gridyScale+screenOffset+Math.floor(gridyScale/2)], [(j-1)*gridxScale+screenOffset+Math.floor(gridxScale/2), (i)*gridyScale+screenOffset+Math.floor(gridyScale/2)], 1, GREEN);
                else if (maze.grid[i][j][1] == j+1)
                    drawLine([j*gridxScale+screenOffset+Math.floor(gridxScale/2), i*gridyScale+screenOffset+Math.floor(gridyScale/2)], [(j+1)*gridxScale+screenOffset+Math.floor(gridxScale/2), (i)*gridyScale+screenOffset+Math.floor(gridyScale/2)], 1, GREEN);
            }
        }
    }

    if (drawWalls) {
        for (let i = 0; i < maze.grid.length; i++) {
            for (let j = 0; j < maze.grid[i].length; j++) {
                if (!arrEqual(maze.grid[i][j], [i-1, j]) && (i == 0 || !arrEqual(maze.grid[i-1][j], [i, j])) && !arrEqual([i, j], maze.start)) // Not pointing up and either on top edge or box above isnt pointing down
                    drawLine([j*gridxScale+screenOffset, i*gridyScale+screenOffset], [(j+1)*gridxScale+screenOffset, i*gridyScale+screenOffset], 1, BLACK);
                if (!arrEqual(maze.grid[i][j], [i+1, j]) && (i == gridHeight - 1 || !arrEqual(maze.grid[i+1][j], [i, j])) && !arrEqual([i, j], maze.end)) // Not pointing down and either on bottom edge or box below isnt pointing up
                    drawLine([j*gridxScale+screenOffset, (i+1)*gridyScale+screenOffset], [(j+1)*gridxScale+screenOffset, (i+1)*gridyScale+screenOffset], 1, BLACK);
                if (!arrEqual(maze.grid[i][j], [i, j-1]) && (j == 0 || !arrEqual(maze.grid[i][j-1], [i, j]))) // Not pointing left and either on left edge or box left isnt pointing rght
                    drawLine([j*gridxScale+screenOffset, i*gridyScale+screenOffset], [j*gridxScale+screenOffset, (i+1)*gridyScale+screenOffset], 1, BLACK);
                if (!arrEqual(maze.grid[i][j], [i, j+1]) && (j == gridWidth - 1 || !arrEqual(maze.grid[i][j+1], [i, j]))) // Not pointing right and either on right edge or box right isnt pointing left
                    drawLine([(j+1)*gridxScale+screenOffset, i*gridyScale+screenOffset], [(j+1)*gridxScale+screenOffset, (i+1)*gridyScale+screenOffset], 1, BLACK);
            }
        }
    }
    
    if (drawSolution) {
        for (let i = 0; i < maze.solutionpath.length - 1; i++) {
            let y1 = maze.solutionpath[i][0];
            let x1 = maze.solutionpath[i][1];
            let y2 = maze.solutionpath[i+1][0];
            let x2 = maze.solutionpath[i+1][1];
            drawLine([x1*gridxScale+screenOffset+Math.floor(gridxScale/2), y1*gridyScale+screenOffset+Math.floor(gridyScale/2)], [x2*gridxScale+screenOffset+Math.floor(gridxScale/2), y2*gridyScale+screenOffset+Math.floor(gridyScale/2)], 1, RED);
        }
    }
}

function update() {
    draw();
    requestAnimationFrame(update);
}

resetMaze();
update();