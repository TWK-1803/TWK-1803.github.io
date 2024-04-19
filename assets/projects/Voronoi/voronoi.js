const BLACK = "#141414";
const GREEN = "#14f714";
const RED = "#f71414";
const BLUE = "#1414f7";
const GRABRADIUS = 5;

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();

canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var numPoints = parseInt(document.getElementById("numpoints").value, 10);
var autoMovingPoints = false;
var delauneyVisible = false;
var voronoiVisible = true;
var circumcircleVisible = false;
var points = [];
var velocities = [];
var t;

var mouseDown = false;
var selected = null;

class Vertex {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(vertex) {
        return this.x == vertex.x && this.y == vertex.y;
    }
    
    sub(v) {
        return new Vertex(this.x-v.x, this.y-v.y);
    }

    length() {
        return Math.sqrt(Math.pow(this.x, 2)+Math.pow(this.y, 2));
    }
}

class Edge {

    constructor(v0, v1) {
        this.v0 = v0;
        this.v1 = v1;
    }

    equals(edge) {
        return (this.v0.equals(edge.v0) && this.v1.equals(edge.v1) || (this.v0.equals(edge.v1) && this.v1.equals(edge.v0)));
    }
}

class Triangle {
    
    constructor(v0, v1, v2) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        this.e0 = new Edge(v0, v1);
        this.e1 = new Edge(v0, v2);
        this.e2 = new Edge(v1, v2);
        this.circumCirc = calcCircumCirc(v0, v1, v2);
        this.sharesVertexWithSuper = false;
    }
        
    inCircumcircle(v) {
        let dx = this.circumCirc.x - v.x;
        let dy = this.circumCirc.y - v.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) <= this.circumCirc.r;
    }
}

class CircumCircle {

    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}


function clamp(s, n, l) { return Math.max(s, Math.min(n, l)); }

// Assumes that it is in fact being given a triangle like a silly little program
function calcCircumCirc(A, B, C) {

    
    let D = 2*(A.x*(B.y-C.y) + B.x*(C.y-A.y) + C.x*(A.y-B.y));
    // Evil hack which makes the spaghetti gods happy and math students cry
    if (D === 0) {
        D = 1;
    }

    let Cx = (1/D)*((A.x**2+A.y**2)*(B.y-C.y)+(B.x**2+B.y**2)*(C.y-A.y)+(C.x**2+C.y**2)*(A.y-B.y));
    let Cy = (1/D)*((A.x**2+A.y**2)*(C.x-B.x)+(B.x**2+B.y**2)*(A.x-C.x)+(C.x**2+C.y**2)*(B.x-A.x));

    let a = (A.sub(B)).length();
    let b = (A.sub(C)).length();
    let c = (B.sub(C)).length();
    let denom = (a+b+c)*(-a+b+c)*(a-b+c)*(a+b-c);
    let R;
    if (denom === 0) {
        R = 0;
    }
    else {
        R = (a*b*c)/Math.sqrt(denom);
    }

    return new CircumCircle(Cx, Cy, R);
}

function superTriangle(vertices) {
    let minx = 9999;
    let miny = 9999;
    let maxx = -9999;
    let maxy = -9999;

    vertices.forEach(vertex => {
        minx = Math.min(minx, vertex.x);
        miny = Math.min(minx, vertex.y);
        maxx = Math.max(maxx, vertex.x);
        maxy = Math.max(maxx, vertex.y);
    }); 

    let dx = (maxx - minx) * 10;
    let dy = (maxy - miny) * 10;

    let v0 = new Vertex(minx - dx, miny - dy * 3);
    let v1 = new Vertex(minx - dx, maxy + dy);
    let v2 = new Vertex(maxx + dx * 3, maxy + dy);

    return new Triangle(v0, v1, v2);
}

function triangulate(vertices) {
    let st = superTriangle(vertices);

    let triangles = [st];

    vertices.forEach(vertex => {
        triangles = addVertex(vertex, triangles);
    });

    triangles.forEach(triangle => {
        if (sharesVertex(triangle, st)) {
            triangle.sharesVertexWithSuper = true;
        }
    });

    return triangles;
}

function sharesEdge(t1, t2) {
    return (t1.e0.equals(t2.e0) || t1.e0.equals(t2.e1) || t1.e0.equals(t2.e2)  || 
            t1.e1.equals(t2.e0) || t1.e1.equals(t2.e1) || t1.e1.equals(t2.e2)  || 
            t1.e2.equals(t2.e0) || t1.e2.equals(t2.e1) || t1.e2.equals(t2.e2));
}

function sharesVertex(t1, t2) {
    return (t1.v0.equals(t2.v0) || t1.v0.equals(t2.v1) || t1.v0.equals(t2.v2)  || 
            t1.v1.equals(t2.v0) || t1.v1.equals(t2.v1) || t1.v1.equals(t2.v2)  || 
            t1.v2.equals(t2.v0) || t1.v2.equals(t2.v1) || t1.v2.equals(t2.v2));
}

function addVertex(vertex, t) {
    let edges = [];

    let triangles = [];
    
    for (let i = 0; i < t.length; i++) {
        if (t[i].inCircumcircle(vertex)) {
            edges.push(new Edge(t[i].v0, t[i].v1));
            edges.push(new Edge(t[i].v1, t[i].v2));
            edges.push(new Edge(t[i].v2, t[i].v0));
            continue;
        }
        triangles.push(t[i]);
    }

    edges = uniqueEdges(edges);

    edges.forEach(edge => {
        triangles.push(new Triangle(edge.v0, edge.v1, vertex));
    });

    return triangles;
}

function uniqueEdges(edges) {
    let uniqueEdges = [];
    for (let i = 0; i < edges.length; i++) {
        let isUnique = true;
        for (let j = 0; j < edges.length; j++) {
            if (i != j && edges[i].equals(edges[j])) {
                isUnique = false;
                break;
            }
        }

        if (isUnique) {
            uniqueEdges.push(edges[i]);
        }
    }

    return uniqueEdges;
}

function randint(min, max) {
    return Math.floor(Math.random() * (max+1-min) + min);
}

function startDrag() {
    let endloop = false;
    let mousex = mousePos[0];
    let mousey = mousePos[1];

    points.forEach(point => {
        if(endloop){ return; }
            if((-GRABRADIUS <= point.x - mousex  && point.x - mousex <= GRABRADIUS) && (-GRABRADIUS <= point.y - mousey  && point.y - mousey <= GRABRADIUS)) { 
                selected = point; 
                endloop = true;
                mouseDown = true;
            }
    });
}

function drag() {
    if (mouseDown){
        selected.x = clamp(0, mousePos[0], width);
        selected.y = clamp(0, mousePos[1], height);
    }
}

function endDrag() {
    mouseDown = false;
    selected = null;
}

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top; 
    mousePos = [x, y];
}

canvas.addEventListener('mousedown', event => {
    getMousePos(event);
    startDrag();
});

canvas.addEventListener('mouseup', event => {
    getMousePos(event);
    endDrag();
});

canvas.addEventListener('mousemove', event => {
    getMousePos(event);
    drag();
});

window.addEventListener('resize', event => {
    resetSim();
});

function toggleAutoMovingPoints() {
    autoMovingPoints = !autoMovingPoints;
}

function toggleDelauneyVisible() {
    delauneyVisible = !delauneyVisible;
}

function toggleVoronoiVisible() {
    voronoiVisible = !voronoiVisible;
}

function toggleCircumcircleVisible() {
    circumcircleVisible = !circumcircleVisible;
}

function drawCircle(p) {
    ctx.beginPath();
    ctx.fillStyle = RED;
    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
    ctx.fill()
    ctx.closePath();
}

function drawLine(p1, p2, color, w) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    ctx.closePath();
}

function drawHollowCircle(p, r) {
    ctx.beginPath();
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1;
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.stroke()
    ctx.closePath();
}

function combinations(arr) {
    let combinations = [];
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i+1; j < arr.length; j++){
            combinations.push([arr[i], arr[j]]);
        }
    }
    return combinations;
}

function resetSim() {
    
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    numPoints = parseInt(document.getElementById("numpoints").value, 10);

    points = [];
    velocities = [];
    for (let i = 0; i < numPoints; i++) {
        points.push(new Vertex(randint(100,width-100), randint(100, height-100)));
        velocities.push([randint(-1, 1), randint(-1, 1)]);
    }
    t = triangulate(points);

}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(point => {
        drawCircle([point.x, point.y]);
    });

    if (delauneyVisible) {
        t.forEach(triangle => {
            if (!triangle.sharesVertexWithSuper) {
                drawLine([triangle.v0.x, triangle.v0.y], [triangle.v1.x, triangle.v1.y], GREEN, 1);
                drawLine([triangle.v0.x, triangle.v0.y], [triangle.v2.x, triangle.v2.y], GREEN, 1);
                drawLine([triangle.v1.x, triangle.v1.y], [triangle.v2.x, triangle.v2.y], GREEN, 1);
            }
        });
    }

    let combos = combinations(t);
    if (voronoiVisible) {
        combos.forEach(pair => {
            if (sharesEdge(pair[0], pair[1])) {
                drawLine([pair[0].circumCirc.x, pair[0].circumCirc.y], [pair[1].circumCirc.x, pair[1].circumCirc.y], BLACK, 1);
            }
        });
    }

    if (circumcircleVisible) {
        t.forEach(triangle => {
            if (!triangle.sharesVertexWithSuper) {
                drawHollowCircle([triangle.circumCirc.x, triangle.circumCirc.y], triangle.circumCirc.r);
            }
        });
    }
}

function update() {
    if (autoMovingPoints) {
        for (let i = 0; i < numPoints; i++) {
            points[i].x += velocities[i][0];
            points[i].y += velocities[i][1];
            if (points[i].x < 0) {
                points[i].x = 0;
                velocities[i][0] = -velocities[i][0];
            }
            else if (points[i].x > width) {
                points[i].x = width;
                velocities[i][0] = -velocities[i][0];
            }
            if (points[i].y < 0) {
                points[i].y = 0;
                velocities[i][1] = -velocities[i][1];
            }
            else if (points[i].y > height) {
                points[i].y = height;
                velocities[i][1] = -velocities[i][1];
            }
        }
        t = triangulate(points);  
    }

    else {
        if (selected != null) {
            selected.x = clamp(0, mousePos[0], width);
            selected.y = clamp(0, mousePos[1], height);
            t = triangulate(points);    
        }
    }
}

function updateSim() {
    draw();
    update();
    requestAnimationFrame(updateSim);
}

resetSim();
updateSim();