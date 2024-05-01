const BLACK = "#141414";

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();

canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var simulationInput = [];
for (let i = 0; i < 3; i++) {
    let tmp = [];
    for (let j = 0; j < 3; j++) {
        tmp.push(false);
    }
    simulationInput.push(tmp);
}

var running = false;
var tickrate = parseInt(document.getElementById("tickrate").value, 10);
var gridscale = parseInt(document.getElementById("gridscale").value, 10);
var wrapping = document.getElementById("wrapping").checked;
var drawgrid = document.getElementById("drawgrid").checked;
var game;
var mousePos;

class GameOfLife {

    constructor(state) {
        this.width = state[0].length;
        this.height = state.length;
        this.state = state;
        this.nextState = this.getNextState();
    }

    getNextState() {
        let nextState = [];
        for (let i = 0; i < this.height; i++) {
            let tmp = [];
            for (let j = 0; j < this.width; j++) {
                tmp.push(false);
            }
            nextState.push(tmp);
        }

        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                let neighbors = this.getNeighbors(r, c);
                if (this.state[r][c] && (neighbors == 3 || neighbors == 2)) {
                    nextState[r][c] = true;
                }
                else if (!this.state[r][c] && neighbors == 3) {
                    nextState[r][c] = true;
                }
            }
        }
        return nextState;
    }

    getNeighbors(r, c) {
        let count = 0
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (wrapping) {
                    if (this.state[((r + i) % this.height + this.height) % this.height][((c + j) % this.width + this.width) % this.width] && !(i == 0 && j == 0)) {
                        count++;
                    }
                }
                else {
                    if ((0 < r + i  && r + i < this.height) && (0 < c + j  && c + j < this.width) && this.state[r + i][c + j] && !(i == 0 && j == 0)) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    updateState() {
        this.state = this.nextState;
        this.nextState = this.getNextState();
    }

    toString() {
        let result = "";
        this.state.array.forEach(row => {
            row.forEach(elem => {
                result += elem ? "1 " : "0 ";
            });
            result += "\n";
        });
        return result;
    }
}

function drawRectangle(p1, p2) {
    ctx.beginPath();
    ctx.fillStyle = BLACK;
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p1[0], p2[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.fill();
    ctx.closePath();
}

function drawLine(p1, p2, w) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = w;
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    ctx.closePath();
}

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top; 
    mousePos = [x, y];
}

function click() {
    if (!running) {
        let hspace = width / gridscale;
        let xstart = Math.floor(mousePos[0] / hspace) * hspace;
        let vspace = height / gridscale;
        let ystart = Math.floor(mousePos[1] / vspace) * vspace;
        let x = Math.floor(mousePos[0] / hspace);
        let y = Math.floor(mousePos[1] / vspace);
        simulationInput[y][x] = !simulationInput[y][x];
        drawSim();
    }
}

window.addEventListener('resize', event => {
    resetSim();
});

canvas.addEventListener('mousedown', event => {
    getMousePos(event);
    click();
});

function playSimulation() {
    disableControls();
    running = true;
    drawSim();
}

function pauseSimulation() {
    enableControls();
    running = false;
}

function advanceOneStep() {
    stepSimulation();
    drawSim();
}

function stepSimulation() {
    resetGame();
    game.updateState();
    simulationInput = game.state;
}

function drawGrid() {
    let hspace = width / gridscale;
    let vspace = height / gridscale;
    for (let i = 0; i < gridscale; i++) {
        drawLine([i*hspace, 0], [i*hspace, height], 1);
        drawLine([0, i*vspace], [width, i*vspace], 1);
    }
}

function drawState() {
    for (let r = 0; r < gridscale; r++) {
        for (let c = 0; c < gridscale; c++) {
            let hspace = width / gridscale;
            let vspace = height / gridscale;
            if (simulationInput[r][c]) {
                drawRectangle([hspace*c, vspace*r], [hspace*c+hspace, vspace*r+vspace]);
            }
        }
    }
}

function toggleWrapping() {
    wrapping = !wrapping;
}

function toggleDrawGrid() {
    drawgrid = !drawgrid;
    drawSim();
}

function tickrateChange() {
    tickrate = parseInt(document.getElementById("tickrate").value, 10);
}

function disableControls() {
    let controlDiv = document.getElementById("controls");
    Array.from(controlDiv.children).forEach((element) => {
        if (element.id != "home" && element.id != "pause") {
            element.disabled = true;
        }
    });
}

function enableControls() {
    let controlDiv = document.getElementById("controls");
    Array.from(controlDiv.children).forEach((element) => {
        if (element.id != "home" && element.id != "pause") {
            element.disabled = false;
        }
    });
}

function resetGame() {
    game = new GameOfLife(simulationInput);
}

function resetSim() {
    
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    gridscale = parseInt(document.getElementById("gridscale").value, 10);

    simulationInput = [];
    for (let i = 0; i < gridscale; i++) {
        let tmp = [];
        for (let j = 0; j < gridscale; j++) {
            tmp.push(false);
        }
        simulationInput.push(tmp);
    }

    resetGame();
    drawSim();
}

function drawSim() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (running) {
        stepSimulation();
    }
    if (drawgrid) {
        drawGrid();
    }
    drawState();

    if (running) {
        setTimeout(drawSim, tickrate)
    }
}

resetSim();
drawSim();