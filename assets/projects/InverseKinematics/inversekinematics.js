const BLACK = "#141414";

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
const ctx = canvas.getContext("2d");	
const slider = document.getElementById("numsegments");
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var jointSpacing = width*.75;

var joints = [];
var connectors = [];

var segment;

var mousePos = [width*.85, height/2];

const EPSILONTHRESHOLD = 0.01;
const NUMITERATIONS = 10;

class Segment{

    constructor(joints, connectors){
        this.joints = joints;
        this.connectors = connectors;
        this.totalLength = 0;
        for(let i = 0; i < this.connectors.length; i++){
            this.totalLength += connectors[i].length;
        }
    }
}

class Connector{

    constructor(joint1, joint2, length){
        this.joint1 = joint1;
        this.joint2 = joint2;
        this.length = length;
        this.angle = 0;
    }
}

function distance(p1, p2) { 
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2)); 
}

function clamp(s, n, l) { 
    return Math.max(s, Math.min(n, l)); 
}

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top; 
    mousePos =  [x,y];
}

canvas.addEventListener('mousemove', event => {
    getMousePos(event);
});

window.addEventListener('resize', event => {
    resetSim();
});

function updateNumSegments(){
    resetSim();
}

function resetSim(){
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    let endPoint = width*.85;
    let startPoint = 20;
    

    let numSegments = parseInt(document.getElementById("numSegments").value, 10);

    jointSpacing = (endPoint - startPoint)/numSegments;

    joints = [];
    connectors = [];

    for(let i = 0; i < numSegments; i++){
        joints.push(new Vector2(i*jointSpacing + startPoint, height/2));
    }

    for(let i = 0; i < joints.length - 1; i++){
        connectors.push(new Connector(joints[i], joints[i+1], distance(joints[i], joints[i+1])));
    }

    segment = new Segment(joints, connectors);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < segment.joints.length; i++){
        ctx.beginPath();
        ctx.arc(joints[i].x, joints[i].y, 3, 0, Math.PI * 2);
        ctx.fillStyle = BLACK;
        ctx.fill();
        ctx.closePath();
        if (i != 0) {
            ctx.beginPath();
            ctx.moveTo(joints[i-1].x, joints[i-1].y);
            ctx.lineTo(joints[i].x, joints[i].y);
            ctx.strokeStyle = BLACK;
            ctx.stroke();
            ctx.closePath();
        }
    }
}

function runFABRIK() {
    let target = new Vector2(mousePos[0], mousePos[1]);
    let origin = segment.joints[0];
    let mouseDist = target.sub(origin);

    if (mouseDist.length() >= segment.totalLength) {
        let newRelativeTarget = mouseDist.normalize().mul(segment.totalLength);
        target = segment.joints[0].add(newRelativeTarget);
    }
    for (let iter = 0; iter < NUMITERATIONS; iter++) {
        // Backward adjustment
        let previousPoint = segment.joints[segment.joints.length - 1];
        for (let i = segment.joints.length - 1; i > -1; i--){
            if (i == segment.joints.length - 1) {
                segment.joints[i] = target;
                previousPoint = segment.joints[i];
            }
            else {
                let dist = previousPoint.sub(segment.joints[i]);
                let newRelativePos = dist.normalize().mul(segment.connectors[i].length);
                segment.joints[i] = previousPoint.sub(newRelativePos);
                previousPoint = segment.joints[i];
            }
        }
        // Forward adjustment
        for (let i = 0; i < segment.joints.length; i++){
            if (i == 0) {
                segment.joints[i] = origin;
                previousPoint = segment.joints[i];
            }
            else {
                let dist = segment.joints[i].sub(previousPoint);
                let newRelativePos = dist.normalize().mul(segment.connectors[i-1].length);
                segment.joints[i] = previousPoint.add(newRelativePos);
                previousPoint = segment.joints[i];
            }
        }
        let epsilon = (target.sub(segment.joints[segment.joints.length - 1])).length();
        // Average error
        if (epsilon <= EPSILONTHRESHOLD){
            break;
        }
    }

}

function update() {
    draw();
    runFABRIK();
    requestAnimationFrame(update);
}

resetSim();
update();