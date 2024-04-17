// The original code was far too inflexible seeing as it was a freshman year coding assignment, so this is basically
// rewritten from scratch with a bunch of extra features that weren't in the python version.

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var verts = [];
var r = 0.5;
var x = width / 2;
var y = height / 2;
var previousIndex = 0;

function squareVerts(x, y, s) {
    let radius = s/2;
    let points = [[x-radius, y-radius],
                  [x+radius, y-radius],
                  [x+radius, y+radius],
                  [x-radius, y+radius]];
    return points;
}

function triangleVerts(x, y, s) {
    let points = [[x, y-Math.sqrt(3)/3*s],
                  [x+s/2, y+Math.sqrt(3)/6*s],
                  [x-s/2, y+Math.sqrt(3)/6*s]];
    return points;
}

function pentagonVerts(x, y, s) {
    let radius = Math.sin(3*Math.PI/10)*s/Math.sin(2*Math.PI/5);
    let points = [[x+radius*Math.cos(Math.PI/10), y-radius*Math.sin(Math.PI/10)],
                  [x+radius*Math.cos(Math.PI/2), y-radius*Math.sin(Math.PI/2)],
                  [x+radius*Math.cos(9*Math.PI/10), y-radius*Math.sin(9*Math.PI/10)],
                  [x+radius*Math.cos(13*Math.PI/10), y-radius*Math.sin(13*Math.PI/10)],
                  [x+radius*Math.cos(17*Math.PI/10), y-radius*Math.sin(17*Math.PI/10)]];
    return points;
}

function randomVertIndex() {
    return Math.floor(Math.random() * verts.length);
}

window.addEventListener('resize', event => {
    resetSim();
});

function resetSim() {
    
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;
    x = width / 2;
    y = height / 2;

    r = parseFloat(document.getElementById("r").value, 10);

    if(document.getElementById("simType").value == "triangle") {
        verts = triangleVerts(width/2, height/2, width*.7);
    }
    else if(document.getElementById("simType").value == "square") {
        verts = squareVerts(width/2, height/2, width*.7);
    }
    else{
        verts = pentagonVerts(width/2, height/2, width*.5);
    }
}

function update() {
    let randomIndex = randomVertIndex();
    if (!document.getElementById("doubleSelect").checked){
        while(randomIndex == previousIndex){
            randomIndex = randomVertIndex();
        }
        previousIndex = randomIndex;
    }
    x += (verts[randomIndex][0] - x) * r;
    y += (verts[randomIndex][1] - y) * r;
    draw();

    setTimeout(update, 0.1);
}  

function draw() {
    ctx.beginPath();
    ctx.fillStyle = "#141414";
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

resetSim();
update();