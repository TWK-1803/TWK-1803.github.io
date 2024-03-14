const WIDTH = 1000;
const HEIGHT = 800;
const BLACK = "#141414";
const WHITE = "#f7f7f7";
const RED = "#ff5014";
const ORANGE = "#ff8214";
const YELLOW = "#fff014";
const GRAY = "#28282840";
const FPS = 60;
const NUMPOINTS = 1;
const GRABRADIUS = 8;
const GRIDSCALE = 10;
const BURNSPREADCHANCE = 0.07;
const BURNDESTROYCHANCE = 0.03;
const FROZENCANTHAW = true;
const THAWCHANCE = 0.05;
const MAXPARTICLESPAWNS = 3;
const DRAWPOINTS = false;
const DRAWLINES = true;
const DRAWFIRE = true;
const GRIDWIDTH = Math.floor(WIDTH/GRIDSCALE);
const GRIDHEIGHT = Math.floor(HEIGHT/GRIDSCALE);
const DT = 60/1000;
const CSCALE = 1;

var FORCES = [];
var POINTS = [];
var SPRINGS = [];
var FLAMEPARTICLES = [];

var selected = null;
var run = true;
var gravityEnabled = false;
var mouseDown = false;

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");	
canvas.width = WIDTH;
canvas.height = HEIGHT;

canvas.focus();

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
            FORCES.forEach(force => {
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
        else if(this.x > WIDTH){
            this.x = WIDTH;
            this.x_0 = this.x + vx * this.elasticity;
        }
        if(this.y < 0){
            this.y = 0;
            this.y_0 = this.y + vy * this.elasticity;
        }
        else if(this.y > HEIGHT){
            this.y = HEIGHT;
            this.y_0 = this.y + vy * this.elasticity;
        }
    }
}

class Spring{

    constructor(mass1, mass2, length, compressability = 1, maxstrainmult = 99){
        this.mass1 = mass1;
        this.mass2 = mass2;
        this.x = Math.floor((this.mass1.x + this.mass2.x)/2);
        this.y = Math.floor((this.mass1.y + this.mass2.y)/2);
        this.length = length;
        this.compressability = compressability;
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
                if(!this.mass1.frozen){ this.mass1.burning = Math.random() <= BURNSPREADCHANCE ? true : false }
                else if(FROZENCANTHAW){ this.mass1.frozen = Math.random() <= THAWCHANCE ? false : this.mass1.frozen }
            }
            if(!this.mass2.burning){
                if(!this.mass2.frozen){ this.mass2.burning = Math.random() <= BURNSPREADCHANCE ? true : false }
                else if(FROZENCANTHAW){ this.mass2.frozen = Math.random() <= THAWCHANCE ? false : this.mass1.frozen }
            }
        }

        else {
            if(this.mass1.burning || this.mass2.burning) { this.burning = true; }
        }
        if(!this.strained) {    
            let offsetx = dx * percent * this.compressability;
            let offsety = dy * percent * this.compressability;

            if(!this.mass1.frozen) {
                this.mass1.x -= offsetx;
                this.mass1.y -= offsety;
            }
            if (!this.mass2.frozen) {
                this.mass2.x += offsetx;
                this.mass2.y += offsety;
            }
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

    POINTS.forEach(row => {
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

    POINTS.forEach(row => {
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

    POINTS.forEach(row => {
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
    if(gravityEnabled) { FORCES.pop(); gravityEnabled = !gravityEnabled; }
    else{ FORCES.push([0,1]); gravityEnabled = !gravityEnabled; }
}

function drag(mousePos) {
    if (mouseDown) {
        let rect = canvas.getBoundingClientRect()
        let mousex = mousePos[0] - rect.left
        let mousey = mousePos[1] - rect.top

        selected.x = clamp(0, mousex, WIDTH);
        selected.y = clamp(0, mousey, HEIGHT)
    }
}

function endDrag() {
    mouseDown = false;
    selected = null;
}

function setupCloth(){
    POINTS = [];
    SPRINGS = [];
    for(let r = 1; r < GRIDHEIGHT; r++){
        let temparr = [];
        for(let c = 1; c < GRIDWIDTH; c++){
            temparr.push(new Mass(c*GRIDSCALE, r*GRIDSCALE, mass=0.05, elasticity=0.3, frozen = r==1));
        }
        POINTS.push(temparr);
    }

    for(let r = 1; r < GRIDHEIGHT - 1 ; r++){
        for(let c = 0; c < GRIDWIDTH - 1; c++){
            SPRINGS.push(new Spring(POINTS[r][c], POINTS[r-1][c], distance(POINTS[r][c], POINTS[r-1][c]), 1, 99));
        }
    }

    for(let c = 1; c < GRIDWIDTH - 1; c++){
        for(let r = 0; r < GRIDHEIGHT - 1; r++){
            SPRINGS.push(new Spring(POINTS[r][c], POINTS[r][c-1], distance(POINTS[r][c], POINTS[r][c-1]), 1, 99));
        }
    }

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

function simulate() {
    POINTS.forEach(row => {
        row.forEach(point => { point.update(); });
    });
    
    SPRINGS.forEach(spring => {
        spring.update()
        if(spring.strained) {             
            let index = SPRINGS.indexOf(spring);
            SPRINGS.splice(index, 1); 
        }
        else if(spring.burning) {
            if(DRAWFIRE && spring.particlesSpawned < MAXPARTICLESPAWNS) {
                FLAMEPARTICLES.push([[spring.x, spring.y], Math.random() * 4 - 2, Math.random() * -2 - 1, Math.random() * 3 + 3, spring]);
                spring.particlesSpawned += 1;
            }
            if(Math.random() <= BURNDESTROYCHANCE) {
                let index = SPRINGS.indexOf(spring);
                SPRINGS.splice(index, 1); 
            }
        }
    });

    POINTS.forEach(row => {
        row.forEach(point => { point.constrain(); });
    });
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(DRAWLINES) {
        SPRINGS.forEach(spring => {
            ctx.beginPath();
            ctx.moveTo(spring.mass1.x, spring.mass1.y);
            ctx.lineTo(spring.mass2.x, spring.mass2.y);
            ctx.strokeStyle = spring.burning ? RED : BLACK;
            ctx.stroke();
            ctx.closePath();
        });
    }

    if(DRAWPOINTS) {
        POINTS.forEach(row => {
            row.forEach(point => { 
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = BLACK;
                ctx.fill();
                ctx.closePath();
            });
        });
    }

    if(DRAWFIRE) {
        FLAMEPARTICLES.forEach(particle => {
            if(particle[3] <= 0.2){
                particle[4].particlesSpawned -= 1;
                let index = FLAMEPARTICLES.indexOf(particle);
                FLAMEPARTICLES.splice(index, 1); 
            }
            else{
                let color = RED;
                if(particle[3] <= 2){ color = GRAY; }
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

function updateSim() {
    draw();
    simulate();
    requestAnimationFrame(updateSim);
}

setupCloth();
updateSim();
