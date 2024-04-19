const BLACK = "#141414";
const GRABRADIUS = 5;

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var mousePos;
var mouseDown = false;

var basePointCloud = [[width/2-200, height/2], [width/2-100, height/2+100], [width/2+100, height/2+100], [width/2+200, height/2]];
var splines = [];
var selectedPoint = -1;
var drawPoints = document.getElementById("drawpoints").checked;
var addingPoint = false;
var removingPoint = false;
var numberOfTSteps = parseInt(document.getElementById("numtsteps").value, 10);
var mode = 0;
var splineWidth = parseInt(document.getElementById("splinewidth").value, 10);

class BezierCurve {
    constructor(pointCloud) {
        this.pointCloud = pointCloud;
        this.endPoint = this.getEndPoint(0);
    }

    getEndPoint(t) {
        let currentpoints = this.pointCloud;
        while (currentpoints.length > 1) {
            let temppoints = [];
            for (let i = 0; i < currentpoints.length - 1; i++){
                temppoints.push(this.lerp(currentpoints[i], currentpoints[i + 1], t));
            }
            currentpoints = temppoints;
        }
        return currentpoints[0];
    }

    setPoint(index, point) {
        this.pointCloud[index] = point;
    }

    lerp(start, end, t) {
        return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
    }

    getMainPointCloud() {
        return this.pointCloud;
    }
}

class BezierSpline {
    constructor(pointCloud) {
        this.pointCloud = this.generatePointCloud(pointCloud);
        this.curves = this.generateCurves(this.pointCloud);
        this.endPoint = this.getEndPoint(0);
    }

    getEndPoint(t) {
        let currentcurve = Math.floor(t / 1);
        let u = t % 1;
        return this.curves[currentcurve].getEndPoint(u);
    }

    generateCurves(pointCloud) {
        let curves = [];
        for (let i = 0; i < pointCloud.length - 1; i+=3) {
            let tmpPointCloud = [pointCloud[i], pointCloud[i+1], pointCloud[i+2], pointCloud[i + 3]];
            curves.push(new BezierCurve(tmpPointCloud))
        }

        return curves;
    }
    
    generatePointCloud(pointCloud) {
        let points = [];
        for (let i = 0; i < pointCloud.length - 1; i++) {
            let tmp1 = [1 / 4 * (3 * pointCloud[i][0] + pointCloud[i + 1][0]), 1 / 4 * (3 * pointCloud[i][1] + pointCloud[i + 1][1])];
            let tmp2 = [1 / 4 * (pointCloud[i][0] + 3 * pointCloud[i + 1][0]), 1 / 4 * (pointCloud[i][1] + 3 * pointCloud[i + 1][1])];
            points.push(pointCloud[i]);
            points.push(tmp1);
            points.push(tmp2);
        }
        points.push(pointCloud[pointCloud.length-1]);

        return points;
    }

    getMainPointCloud() {
        let tmp = [];
        for (let i = 0; i < this.pointCloud.length; i+=3) {
            tmp.push(this.pointCloud[i]);
        }
        return tmp;
    }

    setPoint(index, point) {
        if (index % 3 !== 0) {
            this.pointCloud[index] = point
        }

        else {
            if (index !== 0) {
                let velocityBehind = [this.pointCloud[index-1][0] - this.pointCloud[index][0], this.pointCloud[index-1][1] - this.pointCloud[index][1]];
                this.pointCloud[index-1] = [point[0] + velocityBehind[0], point[1] + velocityBehind[1]];
            }

            if (index !== this.pointCloud.length - 1) {
                let velocityAhead = [this.pointCloud[index+1][0] - this.pointCloud[index][0], this.pointCloud[index+1][1] - this.pointCloud[index][1]];
                this.pointCloud[index+1] = [point[0] + velocityAhead[0], point[1] + velocityAhead[1]];
            }

            this.pointCloud[index] = point;
        }

        this.curves = this.generateCurves(this.pointCloud);
    }
}

class CardinalSpline {
    constructor(pointCloud, tension=1) {
        this.tension = tension;
        this.velocities = this.generateVelocities(pointCloud);
        this.curves = this.generateCurves(pointCloud);
        this.pointCloud = pointCloud;
        this.endPoint = this.getEndPoint(0);
    }

    generateVelocities(pointCloud) {
        let velocities = [];
        for (let i = 0; i < pointCloud.length; i++) {
            if (i === 0) {
                let vx = pointCloud[0][0] - pointCloud[1][0];
                let vy = pointCloud[0][1] - pointCloud[1][1];
                let tmp = [pointCloud[0][0] + vx, pointCloud[0][1] + vy];
                velocities.push([(pointCloud[1][0] - tmp[0]) * this.tension, (pointCloud[1][1] - tmp[1]) * this.tension]);
            }

            else if (i === pointCloud.length - 1) {
                let vx = pointCloud[i][0] - pointCloud[i - 1][0];
                let vy = pointCloud[i][1] - pointCloud[i - 1][1];
                let tmp = [pointCloud[i][0] + vx, pointCloud[i][1] + vy];
                velocities.push([(tmp[0] - pointCloud[i - 1][0]) * this.tension, (tmp[1] - pointCloud[i - 1][1]) * this.tension]);
            }

            else {
                let vx = pointCloud[i + 1][0] - pointCloud[i - 1][0];
                let vy = pointCloud[i + 1][1] - pointCloud[i - 1][1];
                velocities.push([vx * this.tension, vy * this.tension]);
            }
        }

        return velocities;
    }

    generateCurves(pointCloud) {
        let curves = [];
        for (let i = 0; i < pointCloud.length - 1; i++) {
            let tmp1 = [pointCloud[i][0] + this.velocities[i][0] / 3, pointCloud[i][1] + this.velocities[i][1] / 3];
            let tmp2 = [pointCloud[i + 1][0] - this.velocities[i + 1][0] / 3, pointCloud[i + 1][1] - this.velocities[i + 1][1] / 3];
            let tmpPointCloud = [pointCloud[i], tmp1, tmp2, pointCloud[i + 1]];
            curves.push(new BezierCurve(tmpPointCloud));
        }

        return curves;
    }

    getEndPoint(t) {
        let currentcurve = Math.floor(t / 1);
        let u = t % 1;
        return this.curves[currentcurve].getEndPoint(u);
    }

    getMainPointCloud() {
        return this.pointCloud;
    }

    setPoint(index, point) {
        this.pointCloud[index] = point;
        this.velocities = this.generateVelocities(this.pointCloud);
        this.curves = this.generateCurves(this.pointCloud);
    }
}

class CatmullRomSpline extends CardinalSpline {
    constructor(pointCloud) {
        super(pointCloud, 0.5);
    }
}

class HermiteSpline {
    constructor(pointCloud) {
        this.velocities = this.generateVelocities(pointCloud);
        this.curves = this.generateCurves(pointCloud);
        this.pointCloud = this.generatePointCloud(pointCloud);
        this.endPoint = this.getEndPoint(0);
    }

    generateVelocities(pointCloud) {
        let velocities = [];
        for (let i = 0; i < pointCloud.length - 1; i++) {
            let tmp = [(pointCloud[i][0] + pointCloud[i + 1][0]) / 2, (pointCloud[i][1] + pointCloud[i + 1][1]) / 2];
            velocities.push([tmp[0] - pointCloud[i][0], tmp[1] - pointCloud[i][1]]);
        }

        velocities.push([30, 30]);
        return velocities;
    }

    generateCurves(pointCloud) {
        let curves = [];
        for (let i = 0; i < pointCloud.length - 1; i++) {
            let tmp1 = [pointCloud[i][0] + this.velocities[i][0] / 3, pointCloud[i][1] + this.velocities[i][1] / 3];
            let tmp2 = [pointCloud[i + 1][0] - this.velocities[i + 1][0] / 3, pointCloud[i + 1][1] - this.velocities[i + 1][1] / 3];
            let tmpPointCloud = [pointCloud[i], tmp1, tmp2, pointCloud[i + 1]];
            curves.push(new BezierCurve(tmpPointCloud));
        }

        return curves;
    }

    generatePointCloud(pointCloud) {
        let tmp = [];
        for (let i = 0; i < pointCloud.length; i++) {
            tmp.push(pointCloud[i])
            tmp.push([pointCloud[i][0] + this.velocities[i][0], pointCloud[i][1] + this.velocities[i][1]]);
        }

        return tmp;
    }

    getEndPoint(t) {
        let currentcurve = Math.floor(t / 1);
        let u = t % 1;
        return this.curves[currentcurve].getEndPoint(u);
    }

    getMainPointCloud() {
        let tmp = [];
        for (let i = 0; i < this.pointCloud.length; i+=2) {
            tmp.push(this.pointCloud[i]);
        }

        return tmp;
    }

    setPoint(index, point) {
        let i = Math.floor(index / 2);
        this.pointCloud[index] = point;
        if (index % 2 !== 0) {
            this.velocities[i] = [this.pointCloud[index][0] - this.pointCloud[index-1][0], this.pointCloud[index][1] - this.pointCloud[index-1][1]];
        }
        else {
            this.pointCloud[index+1] = [this.pointCloud[index][0] + this.velocities[i][0], this.pointCloud[index][1] + this.velocities[i][1]];
        }

        this.curves = this.generateCurves(this.getMainPointCloud());
    }
}

class LinearSpline {
    constructor(pointCloud) {
        this.pointCloud = pointCloud;
        this.endPoint = this.getEndPoint(0);
    }

    getEndPoint(t) {
        let currentsegment = Math.floor(t / 1);
        let u = t % 1;
        if (currentsegment === this.pointCloud.length - 1) {
            return this.pointCloud[currentsegment];
        }

        else {
            let vx = (this.pointCloud[currentsegment + 1][0] - this.pointCloud[currentsegment][0]) * u;
            let vy = (this.pointCloud[currentsegment + 1][1] - this.pointCloud[currentsegment][1]) * u;
            return [this.pointCloud[currentsegment][0] + vx, this.pointCloud[currentsegment][1] + vy];
        }
    }

    setPoint(index, point) {
        this.pointCloud[index] = point;
    }

    getMainPointCloud() {
        return this.pointCloud;
    }
}

function initializeSplines() {
    splines = [new BezierCurve(basePointCloud),
               new BezierSpline(basePointCloud),
               new HermiteSpline(basePointCloud),
               new LinearSpline(basePointCloud),
               new CardinalSpline(basePointCloud),
               new CatmullRomSpline(basePointCloud)];
}

function drawPointCloud() {
    switch(mode) {
        case 0: drawBezierCurvePointCloud(); break;
        case 1: drawBezierSplinePointCloud(); break;
        case 2: drawHermiteSplinePointCloud(); break;
        case 3: drawLinearSplinePointCloud(); break;
        case 4: drawCardinalSplinePointCloud(); break;
        case 5: drawCatmullRomSplinePointCloud(); break;
    }
}

function drawSpline() {
    let t = 0;
    let previousPoint = [];
    maxt = mode === 0 ? 1 : basePointCloud.length - 1;
    while (t < maxt) {
        splines[mode].endPoint = splines[mode].getEndPoint(t);
        if (previousPoint != []) {
            drawLine(previousPoint, splines[mode].endPoint, splineWidth);
        }
        t += 1 / numberOfTSteps;
        previousPoint = splines[mode].endPoint;
    }

    drawLine(previousPoint, splines[mode].getEndPoint(maxt-0.000001), splineWidth);
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

function drawRectangle(p) {
    ctx.beginPath();
    ctx.fillStyle = BLACK;
    ctx.moveTo(p[0]-5, p[1]-5);
    ctx.lineTo(p[0]+5, p[1]-5);
    ctx.lineTo(p[0]+5, p[1]+5);
    ctx.lineTo(p[0]-5, p[1]+5);
    ctx.lineTo(p[0]-5, p[1]-5);
    ctx.fill();
    ctx.closePath();
}

function drawHollowCircle(p) {
    ctx.beginPath();
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 1;
    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
    ctx.stroke()
    ctx.closePath();
}

function drawBezierCurvePointCloud() {
    if (drawPoints) {
        let previousCoord = [];
        splines[0].pointCloud.forEach(point => {
            if (previousCoord != []) {
                drawLine(previousCoord, point, 1);
            }
            previousCoord = point;
            drawRectangle(previousCoord);
        });
    }
}

function drawBezierSplinePointCloud() {
    if (drawPoints) {
        let currentCurve = []
        for (let i = 0; i < splines[1].pointCloud.length; i++) {
            currentCurve.push(splines[1].pointCloud[i]);
            if (i % 3 === 0) {
                drawRectangle(splines[1].pointCloud[i]);

                if (currentCurve.length >= 4) {
                    drawLine(currentCurve[0], currentCurve[3], 1);
                    drawLine(currentCurve[0], currentCurve[1], 1);
                    drawLine(currentCurve[2], currentCurve[3], 1);
                    currentCurve = [currentCurve[currentCurve.length - 1]];
                }
            }
            else {
                drawHollowCircle(splines[1].pointCloud[i]);
            }
        }
    }
}

function drawHermiteSplinePointCloud() {
    if (drawPoints) {
        let currentCurve = [];
        for (let i = 0; i < splines[2].pointCloud.length; i++) {
            currentCurve.push(splines[2].pointCloud[i]);
            if (i % 2 === 0) {
                drawRectangle(splines[2].pointCloud[i]);
                if (currentCurve.length >= 3) {
                    drawLine(currentCurve[0], currentCurve[2], 1);
                    currentCurve = [currentCurve[currentCurve.length-1]];
                }
            }
            else {
                drawHollowCircle(splines[2].pointCloud[i]);
                drawLine(currentCurve[0], currentCurve[1], 1);
            }
        }
    }
}


function drawLinearSplinePointCloud() {
    if (drawPoints) {
        for (let i = 0; i < splines[3].pointCloud.length; i++) {
            drawRectangle(splines[3].pointCloud[i]);
        }
    }
}


function drawCardinalSplinePointCloud() {
    if (drawPoints) {
        let previousCoord = [];
        for (let i = 0; i < splines[4].pointCloud.length; i++) {
            if (previousCoord != []) {
                drawLine(previousCoord, splines[4].pointCloud[i], 1);
            }
            previousCoord = splines[4].pointCloud[i];
            drawRectangle(previousCoord);
        }
    }
}


function drawCatmullRomSplinePointCloud() {
    if (drawPoints) {
        let previousCoord = [];
        for (let i = 0; i < splines[5].pointCloud.length; i++) {
            if (previousCoord != []) {
                drawLine(previousCoord, splines[5].pointCloud[i], 1);
            }
            previousCoord = splines[5].pointCloud[i];
            drawRectangle(previousCoord);
        }
    }
}

function drag() {
    if (mouseDown){
        splines[mode].setPoint(selectedPoint, mousePos);
    }
}

function endDrag() {
    mouseDown = false;
    selected = -1;
}

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top; 
    mousePos = [x, y];
}

canvas.addEventListener('mousedown', event => {
    getMousePos(event);
    click();
});

canvas.addEventListener('mouseup', event => {
    getMousePos(event);
    release();
});

canvas.addEventListener('mousemove', event => {
    getMousePos(event);
    drag();
});

window.addEventListener('resize', event => {
    resetSim();
});

function clamp(s, n, l) { return Math.max(s, Math.min(n, l)); }

function click() {
    if (drawPoints && !addingPoint && !removingPoint) {
        if (selectedPoint === -1) {
            let tmp = splines[mode].pointCloud;

            for (let i = 0; i < tmp.length; i++) {
                if((-GRABRADIUS <= tmp[i][0] - mousePos[0] && tmp[i][0] - mousePos[0] <= GRABRADIUS) && (-GRABRADIUS <= tmp[i][1] - mousePos[1]  && tmp[i][1] - mousePos[1] <= GRABRADIUS)) { 
                    selectedPoint = i;
                    mouseDown = true;
                }
            }
        }
        if (selectedPoint !== -1) {
            let x = clamp(0, mousePos[0], width);
            let y = clamp(0, mousePos[1], height);

            splines[mode].setPoint(selectedPoint, [x, y]);
        }
    }
}

function release() {
    if (addingPoint) {
        if ((0 <= mousePos[0] <= width) && (0 <= mousePos[1] <= height)) {
            basePointCloud.push([mousePos[0], mousePos[1]]);
            addingPoint = false;
            enableControls();
            initializeSplines();
        }
    }

    else if (removingPoint) {
        let tmp = splines[mode].getMainPointCloud()
        let index = -1;
        for (let i = 0; i < tmp.length; i++) {
            if((-GRABRADIUS <= tmp[i][0] - mousePos[0] && tmp[i][0] - mousePos[0] <= GRABRADIUS) && (-GRABRADIUS <= tmp[i][1] - mousePos[1]  && tmp[i][1] - mousePos[1] <= GRABRADIUS)) { 
                index = i;
                break;
            }
        }
        if (index !== -1) {
            basePointCloud.splice(index, 1);
        }
        removingPoint = false;
        enableControls();
        initializeSplines();
    }

    selectedPoint = -1;
    mouseDown = false;
}

function addPoint() {
    disableControls();
    addingPoint = true;
}


function removePoint() {
    if (splines[mode].getMainPointCloud().length > 2) {
        disableControls();
        removingPoint = true;
    }
}

function disableControls() {
    let controlDiv = document.getElementById("controls");
    Array.from(controlDiv.children).forEach((element) => {
        if (element.id != "home") {
            element.disabled = true;
        }
    });
}

function enableControls() {
    let controlDiv = document.getElementById("controls");
    Array.from(controlDiv.children).forEach((element) => {
        if (element.id != "home") {
            element.disabled = false;
        }
    });
}

function modeChanged() {
    let selection = document.getElementById("spline").value;
    basePointCloud = splines[mode].getMainPointCloud();
    switch (selection) {
        case "beziercurve": mode = 0; break;
        case "bezierspline": mode = 1; break;
        case "hermitespline": mode = 2; break;
        case "linearspline": mode = 3; break;
        case "cardinalspline": mode = 4; break;
        case "catmullromspline": mode = 5; break; 
    }
    
    resetSim();
}

function toggleDrawPoints() {
    drawPoints = !drawPoints;
}


function splineWidthChange() { 
    splineWidth = parseInt(document.getElementById("splinewidth").value, 10);
}

function numberOfTStepsChange() {
    numberOfTSteps = parseInt(document.getElementById("numtsteps").value, 10);
}

function resetSim() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    initializeSplines();
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPointCloud();
    drawSpline();
    requestAnimationFrame(draw);
}

resetSim();
draw();