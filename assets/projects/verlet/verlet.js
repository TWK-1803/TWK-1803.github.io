const BLACK = "#141414";
const WHITE = "#f7f7f7";
const BLUE = "#1414f7"
const RED = "#ff5014";
const ORANGE = "#ff8214";
const YELLOW = "#fff014";
const GRAY = "#28282840";
const FPS = 60;
const DT = FPS/1000;
const GRABRADIUS = 5;
const MAXPARTICLESPAWNS = 3;

var canvas = document.getElementById("myCanvas");
var canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var forces = [[0,0]];
var points = [];
var springs = [];
var flameParticles = [];

var burnSpreadChance = document.getElementById("burnSpreadChance").value / 100;
var burnDestroyChance = document.getElementById("burnDestroyChance").value / 100;
var thawChance = document.getElementById("thawChance").value / 100;
var inputStrainMult = document.getElementById("inputStrainMult").value;
var inputStiffness = document.getElementById("inputStiffness").value / 100;
var inputMass = document.getElementById("inputMass").value / 100;
var inputElesticity = document.getElementById("inputElesticity").value / 100;
var gridScale = document.getElementById("gridScale").value;

var gridWidth = Math.floor(width/gridScale);
var gridHeight = Math.floor(height/gridScale);

var drawPoints = false;
var drawLines = true;
var drawFire = true;
var gravityEnabled = false;
var windEnabled = false;
var frozenCanThaw = false;
var mouseDown = false;

var selected = null;

class Mass{

    constructor(x, y, mass = 0.1, elasticity = 1, frozen = false){
        this.x = x;
        this.x_0 = x;
        this.y = y;
        this.y_0 = y;
        this.mass = mass;
        this.elasticity = elasticity;
        this.frozen = frozen;
        this.burning = false;
    }
    
    update(){
        if(!this.frozen) {
            let fx = 0;
            let fy = 0;
            forces.forEach(force => {
                fx += force[0];
                fy += force[1];
            });

            let ax = fx/this.mass;
            let ay = fy/this.mass;
            
            let tempx = this.x;
            let tempy = this.y;

            this.x = 2 * this.x - this.x_0 + ax * Math.pow(DT, 2);
            this.y = 2 * this.y - this.y_0 + ay * Math.pow(DT, 2);

            this.x_0 = tempx;
            this.y_0 = tempy;
        }
    }

    constrain(){
        let vx = this.x - this.x_0;
        let vy = this.y - this.y_0;

        if(this.x < 0){
            this.x = 0;
            this.x_0 = this.x + vx * this.elasticity;
        }
        else if(this.x > width){
            this.x = width;
            this.x_0 = this.x + vx * this.elasticity;
        }
        if(this.y < 0){
            this.y = 0;
            this.y_0 = this.y + vy * this.elasticity;
        }
        else if(this.y > height){
            this.y = height;
            this.y_0 = this.y + vy * this.elasticity;
        }
    }
}

class Spring{

    constructor(mass1, mass2, length, stiffness = 1, maxstrainmult = 99){
        this.mass1 = mass1;
        this.mass2 = mass2;
        this.x = Math.floor((this.mass1.x + this.mass2.x)/2);
        this.y = Math.floor((this.mass1.y + this.mass2.y)/2);
        this.length = length;
        this.stiffness = stiffness;
        this.strained = false;
        this.maxstrainmult = maxstrainmult;
        this.burning = false;
        this.particlesSpawned = 0;
    }

    update(){
        var dx = this.mass2.x - this.mass1.x;
        var dy = this.mass2.y - this.mass1.y;
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        var diff = this.length - dist;
        var percent = 0;
        if(diff != 0) { percent = (diff/dist)/2; }

        this.strained = dist > this.length * this.maxstrainmult;
        
        if(this.burning){
            if(!this.mass1.burning){
                if(!this.mass1.frozen){ this.mass1.burning = Math.random() <= burnSpreadChance ? true : false }
                else if(frozenCanThaw){ this.mass1.frozen = Math.random() <= thawChance ? false : this.mass1.frozen }
            }
            if(!this.mass2.burning){
                if(!this.mass2.frozen){ this.mass2.burning = Math.random() <= burnSpreadChance ? true : false }
                else if(frozenCanThaw){ this.mass2.frozen = Math.random() <= thawChance ? false : this.mass1.frozen }
            }
        }

        else {
            if(this.mass1.burning || this.mass2.burning) { this.burning = true; }
        }
        if(!this.strained) {    
            let offsetx = dx * percent * this.stiffness;
            let offsety = dy * percent * this.stiffness;

            if(!this.mass1.frozen) {
                this.mass1.x -= offsetx;
                this.mass1.y -= offsety;
            }
            if (!this.mass2.frozen) {
                this.mass2.x += offsetx;
                this.mass2.y += offsety;
            }
        }
        else{
            endDrag();
        }
        this.x = Math.floor((this.mass1.x + this.mass2.x)/2);
        this.y = Math.floor((this.mass1.y + this.mass2.y)/2);
    }
}

function distance(p1, p2) { 
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2)); 
}

function clamp(s, n, l) { return Math.max(s, Math.min(n, l)); }

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top; 
    return [x,y];
}

function startDrag(mousePos) {
    let endloop = false;
    let mousex = mousePos[0];
    let mousey = mousePos[1];

    points.forEach(row => {
        row.forEach(point => {
            if(endloop){ return; }
            if((-GRABRADIUS <= point.x - mousex  && point.x - mousex <= GRABRADIUS) && (-GRABRADIUS <= point.y - mousey  && point.y - mousey <= GRABRADIUS)) { 
                selected = point; 
                endloop = true;
                mouseDown = true;
            }
        });
    });
}

function setBurning(mousePos) {
    let endloop = false;
    let mousex = mousePos[0];
    let mousey = mousePos[1];

    points.forEach(row => {
        row.forEach(point => {
            if(endloop){ return; }
            if((-GRABRADIUS <= point.x - mousex  && point.x - mousex <= GRABRADIUS) && (-GRABRADIUS <= point.y - mousey  && point.y - mousey <= GRABRADIUS)) { 
                point.burning = true; 
                endloop = true;
            }
        });
    });
}

function toggleFrozen(mousePos) {
    let endloop = false;
    let mousex = mousePos[0];
    let mousey = mousePos[1];

    points.forEach(row => {
        row.forEach(point => {
            if(endloop){ return; }
            if((-GRABRADIUS <= point.x - mousex  && point.x - mousex <= GRABRADIUS) && (-GRABRADIUS <= point.y - mousey  && point.y - mousey <= GRABRADIUS)) { 
                point.frozen = !point.frozen; 
                endloop = true;
            }
        });
    });
}

function toggleGravity(){
    if(gravityEnabled) { forces[0][1] = 0; gravityEnabled = !gravityEnabled; }
    else{ forces[0][1] = 1; gravityEnabled = !gravityEnabled; }
}
function toggleWind(){
    if(windEnabled) { forces[0][0] = 0; windEnabled = !windEnabled; }
    else{ forces[0][0] = 1; windEnabled = !windEnabled; }
}

function toggleDrawPoints(){
    drawPoints = !drawPoints;
}

function toggleDrawLines(){
    drawLines = !drawLines;
}

function toggleDrawFire(){
    drawFire = !drawFire;
}

function toggleFrozenCanThaw(){
    frozenCanThaw = !frozenCanThaw;
}
function drag(mousePos) {
    if (mouseDown) {
        let rect = canvas.getBoundingClientRect()
        let mousex = mousePos[0] - rect.left
        let mousey = mousePos[1] - rect.top

        selected.x = clamp(0, mousex, width);
        selected.y = clamp(0, mousey, height)
    }
}

function endDrag() {
    mouseDown = false;
    selected = null;
}

function updateBurnSpreadChance() {
    burnSpreadChance = document.getElementById("burnSpreadChance").value / 100;
}

function updateBurnDestroyChance() {
    burnDestroyChance = document.getElementById("burnDestroyChance").value / 100;
}

function updateThawChance() {
    thawChance = document.getElementById("thawChance").value / 100;
}

canvas.addEventListener('mousedown', event => {
    switch(event.button) {
        case 0 : { startDrag(getMousePos(event)); break; }
        case 1 : { toggleFrozen(getMousePos(event)); break; }
        case 2 : { setBurning(getMousePos(event)); break; }
    }
});

canvas.addEventListener('mouseup', event => {
    endDrag();
});

canvas.addEventListener('mousemove', event => {
    drag(getMousePos(event));
});

window.addEventListener('resize', event => {
    resetSim();
});

function simulate() {
    points.forEach(row => {
        row.forEach(point => { point.update(); });
    });
    
    springs.forEach(spring => {
        spring.update()
        if(spring.strained) {             
            let index = springs.indexOf(spring);
            springs.splice(index, 1); 
        }
        else if(spring.burning) {
            if(drawFire && spring.particlesSpawned < MAXPARTICLESPAWNS) {
                flameParticles.push([[spring.x, spring.y], Math.random() * 4 - 2, Math.random() * -2 - 1, Math.random() * 3 + 3, spring]);
                spring.particlesSpawned += 1;
            }
            if(Math.random() <= burnDestroyChance) {
                let index = springs.indexOf(spring);
                springs.splice(index, 1); 
            }
        }
    });

    points.forEach(row => {
        row.forEach(point => { point.constrain(); });
    });
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(drawLines) {
        springs.forEach(spring => {
            ctx.beginPath();
            ctx.moveTo(spring.mass1.x, spring.mass1.y);
            ctx.lineTo(spring.mass2.x, spring.mass2.y);
            ctx.strokeStyle = spring.burning ? RED : BLACK;
            ctx.stroke();
            ctx.closePath();
        });
    }

    if(drawPoints) {
        points.forEach(row => {
            row.forEach(point => { 
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = point.frozen ? BLUE : point.burning ? RED : BLACK;
                ctx.fill();
                ctx.closePath();
            });
        });
    }

    if(drawFire) {
        flameParticles.forEach(particle => {
            if(particle[3] <= 0.2){
                particle[4].particlesSpawned -= 1;
                let index = flameParticles.indexOf(particle);
                flameParticles.splice(index, 1); 
            }
            else {
                let color = RED;
                if(particle[3] <= 2) { color = GRAY; }
                else if(particle[3] <= 3) { color = YELLOW; }
                else if(particle[3] <= 4) { color = ORANGE; }

                ctx.beginPath();
                ctx.arc(particle[0][0], particle[0][1], particle[3], 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();

                particle[0][0] += particle[1] * DT * 20
                particle[0][1] += particle[2] * DT * 20
                particle[3] -= Math.random() * DT * 20
            }
        });
    }
}

function setupCloth() {
    points = [];
    springs = [];
    for(let r = 1; r < gridHeight; r++){
        let temparr = [];
        for(let c = 1; c < gridWidth; c++){
            temparr.push(new Mass(c*gridScale, r*gridScale, inputMass, inputElesticity, frozen = r==1));
        }
        points.push(temparr);
    }

    for(let r = 1; r < gridHeight - 1 ; r++){
        for(let c = 0; c < gridWidth - 1; c++){
            springs.push(new Spring(points[r][c], points[r-1][c], distance(points[r][c], points[r-1][c]), inputStiffness, inputStrainMult));
        }
    }

    for(let c = 1; c < gridWidth - 1; c++){
        for(let r = 0; r < gridHeight - 1; r++){
            springs.push(new Spring(points[r][c], points[r][c-1], distance(points[r][c], points[r][c-1]), inputStiffness, inputStrainMult));
        }
    }
}

function setupBall() {
    points = [];
    springs = [];
    let temparr = [];
    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);
    let r = 40;
    for(let i = 1; i <=15; i+=2) {
        temparr.push(new Mass(x+r*Math.cos(i*Math.PI/8), y-r*Math.sin(i*Math.PI/8), inputMass, inputElesticity, false));
    }
    points.push(temparr);

    for(let i = 0; i < 8; i++) {
        springs.push(new Spring(points[0][i], points[0][(i+1) % 8], distance(points[0][i], points[0][(i+1) % 8]), inputStiffness, inputStrainMult));
    }

    for(let i = 0; i < 8; i++) {
        springs.push(new Spring(points[0][i], points[0][(i+2) % 8], distance(points[0][i], points[0][(i+2) % 8]), inputStiffness, inputStrainMult));
    }

    for(let i = 0; i < 8; i++) {
        springs.push(new Spring(points[0][i], points[0][(i+3) % 8], distance(points[0][i], points[0][(i+3) % 8]), inputStiffness, inputStrainMult));
    }

    for(let i = 0; i < 4; i++) {
        springs.push(new Spring(points[0][i], points[0][i+4], distance(points[0][i], points[0][i+4]), inputStiffness, inputStrainMult));
    }
    
}

function resetSim(){
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    inputStrainMult = document.getElementById("inputStrainMult").value;
    inputStiffness = document.getElementById("inputStiffness").value / 100;
    inputMass = document.getElementById("inputMass").value / 100;
    inputElesticity = document.getElementById("inputElesticity").value / 100;
    gridScale = document.getElementById("gridScale").value;
    
    gridWidth = Math.floor(width/gridScale);
    gridHeight = Math.floor(height/gridScale);

    if(document.getElementById("simType").value == "cloth") {
        setupCloth();
    }
    else if(document.getElementById("simType").value == "ball") {
        setupBall();
    }
}

function updateSim() {
    draw();
    simulate();
    requestAnimationFrame(updateSim);
}

resetSim();
updateSim();