const BLACK = "#141414";
const GREEN = "#14F714";
const GRABRADIUS = 3;

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var screenOffset = width*.1;

var mousePos;

class Vector3 {
    constructor(x, y=null, w=null) {
        this.x = x;
        if (y != null) {
            this.y = y;
        }
        else {
            this.y = x;
        }
        if (w != null) {
            this.w = w;
        }
        else {
            this.w = 0;
        }
    }
    normalize() {
        var m = this.length();
        if (m == 0) {
            return this;
        }
        return this.div(m);
    };
    dot(v) {
        return this.x * v.x + this.y * v.y + this.w * v.w;
    };
    dot2() {
        return this.dot(this);
    };
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.w, 2));
    };
    cross(v){
        return new Vector3(this.y * v.w - this.w * v.y, this.w * v.x - this.x * v.w, this.x * v.y - this.y * v.x)
    }
    angle() {
        return Math.atan2(this.y, this.x);
    };
    translate(v) {
        return this.add(v);
    };
    scale(n) {
        return this.mul(n);
    };
    rotate(theta) {
        return new Vector3(this.x * Math.cos(theta) - this.y * Math.sin(theta), this.x * Math.sin(theta) + this.y * Math.cos(theta), this.w);
    };
    equals(v) {
        return this.x == v.x && this.y == v.y && this.w == this.v.w;
    };
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.w + v.w);
    };
    sub(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.w - v.w);
    };
    neg() {
        return new Vector3(-this.x, -this.y, -this.w);
    };
    div(n) {
        return new Vector3(this.x / n, this.y / n, this.w / n);
    };
    mul(n) {
        return new Vector3(this.x * n, this.y * n, this.w * n);
    };
    toString() {
        return "(".concat(this.x, ",").concat(this.y, ",").concat(this.x, ")");
    };
}

// Circles are not considered polygons
class Circle {

    constructor(x, y, r) {
        this.pos = new Vector3(x, y);
        this.radius = r;
        this.colliding = false;
    }
    // all transformations are performed assuming the origin provided or the origin of the screen if none
    translate(v) {
        this.pos = this.pos.add(v);
    }
    
    scale(s) {
        this.radius = this.radius * s;
    }

    // Included for interfacing consistency
    rotate(theta) {
    }

    furthestPoint(d) {
        let theta = d.angle()
        return new Vector3(this.radius * Math.cos(theta), this.radius * Math.sin(theta)).add(this.pos);
    }

    display(color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.stroke()
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

class Polygon {

    constructor(x, y, points) {
        this.pos = new Vector3(x, y);
        this.points = points;
        this.colliding = false;
    }

    // all transformations are performed assuming the origin provided or the origin of the screen if none
    translate(v) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i] = this.points[i].add(v);
        }
        this.pos = this.pos.add(v)
    }

    scale(s) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i] = ((this.points[i].sub(this.pos)).scale(s)).add(this.pos);
        }
    }

    // Negated theta because a y-up coordinate system is assumed
    rotate(theta) {
        for (let i = 0; i < this.points.length; i++){
            this.points[i] = ((this.points[i].sub(this.pos)).rotate(-theta)).add(this.pos);
        }
    }

    furthestPoint(d) {
        let result = this.points[0];
        let dotmax = d.dot(result);
        for (let i = 0; i < this.points.length; i++) {
            let product = d.dot(this.points[i]);
            if (product > dotmax){
                dotmax = product;
                result = this.points[i];
            }
        }
        return result;
    }
    
    display(color) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length + 1; i++) {
            ctx.lineTo(this.points[i % this.points.length].x, this.points[i % this.points.length].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

    }
}
    
class Square extends Polygon {

    constructor(x, y, s) {
        let r = s/2;
        let points = [new Vector3(x-r, y-r),
                      new Vector3(x+r, y-r),
                      new Vector3(x+r, y+r),
                      new  Vector3(x-r, y+r)];
        super(x, y, points);
    }
}

class Triangle extends Polygon {

    constructor(x, y, s) {
        let points = [new Vector3(x, y-Math.sqrt(3)/3*s),
                      new Vector3(x+s/2, y+Math.sqrt(3)/6*s),
                      new Vector3(x-s/2, y+Math.sqrt(3)/6*s)];
        super(x, y, points);
    }
}

class Pentagon extends Polygon {

    constructor(x, y, s) {
        let r = Math.sin(3*Math.PI/10)*s/Math.sin(2*Math.PI/5);
        let points = [new Vector3(x+r*Math.cos(Math.PI/10), y-r*Math.sin(Math.PI/10)),
                      new Vector3(x+r*Math.cos(Math.PI/2), y-r*Math.sin(Math.PI/2)),
                      new Vector3(x+r*Math.cos(9*Math.PI/10), y-r*Math.sin(9*Math.PI/10)),
                      new Vector3(x+r*Math.cos(13*Math.PI/10), y-r*Math.sin(13*Math.PI/10)),
                      new Vector3(x+r*Math.cos(17*Math.PI/10), y-r*Math.sin(17*Math.PI/10))];
        super(x, y, points);
    }
}

class Hexagon extends Polygon {

    constructor(x, y, s) {
        let points = [new Vector3(x+s, y),
                      new Vector3(x+s*Math.cos(Math.PI/3), y-s*Math.sin(Math.PI/3)),
                      new Vector3(x+s*Math.cos(2*Math.PI/3), y-s*Math.sin(2*Math.PI/3)),
                      new Vector3(x-s, y),
                      new Vector3(x+s*Math.cos(4*Math.PI/3), y-s*Math.sin(4*Math.PI/3)),
                      new Vector3(x+s*Math.cos(5*Math.PI/3), y-s*Math.sin(5*Math.PI/3))];
        super(x, y, points);
    }
}

class Heptagon extends Polygon {

    constructor(x, y, s) {
        let r = Math.sin(5*Math.PI/14)*s/Math.sin(2*Math.PI/7);
        let points = [new Vector3(x+r*Math.cos(3*Math.PI/14), y-r*Math.sin(3*Math.PI/14)),
                      new Vector3(x, y-r),
                      new Vector3(x+r*Math.cos(11*Math.PI/14), y-r*Math.sin(11*Math.PI/14)),
                      new Vector3(x+r*Math.cos(15*Math.PI/14), y-r*Math.sin(15*Math.PI/14)),
                      new Vector3(x+r*Math.cos(19*Math.PI/14), y-r*Math.sin(19*Math.PI/14)),
                      new Vector3(x+r*Math.cos(23*Math.PI/14), y-r*Math.sin(23*Math.PI/14)),
                      new Vector3(x+r*Math.cos(27*Math.PI/14), y-r*Math.sin(27*Math.PI/14))];
        super(x, y, points);
    }
}

class Octagon extends Polygon {

    constructor(x, y, s) {
        let r = Math.sin(3*Math.PI/8)*s/Math.sin(Math.PI/4);
        let points = [new Vector3(x+r*Math.cos(Math.PI/8), y-r*Math.sin(Math.PI/8)),
                      new Vector3(x+r*Math.cos(3*Math.PI/8), y-r*Math.sin(3*Math.PI/8)),
                      new Vector3(x+r*Math.cos(5*Math.PI/8), y-r*Math.sin(5*Math.PI/8)),
                      new Vector3(x+r*Math.cos(7*Math.PI/8), y-r*Math.sin(7*Math.PI/8)),
                      new Vector3(x+r*Math.cos(9*Math.PI/8), y-r*Math.sin(9*Math.PI/8)),
                      new Vector3(x+r*Math.cos(11*Math.PI/8), y-r*Math.sin(11*Math.PI/8)),
                      new Vector3(x+r*Math.cos(13*Math.PI/8), y-r*Math.sin(13*Math.PI/8)),
                      new Vector3(x+r*Math.cos(15*Math.PI/8), y-r*Math.sin(15*Math.PI/8))];
        super(x, y, points);
    }
}

var objects = [new Circle(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Triangle(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Square(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Pentagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Hexagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Heptagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Octagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset))];

var angle = 0
var selected = null;
var direction = new Vector3(0,0);
var o = new Vector3(0,0);
var mousePos;

function tripleProd(v1, v2, v3) {
    return (v1.cross(v2)).cross(v3);
}

function lineCase(simplex) {
    let B = simplex[0];
    let A = simplex[1];
    let AB = B.sub(A);
    let AO = o.sub(A);
    if (AB.normalize().equals(AO.normalize())) { 
        return true; 
    }
    let ABperp = tripleProd(AB, AO, AB);
    direction = ABperp;
    return false;
}

function triangleCase(simplex) {
    let C = simplex[0];
    let B = simplex[1];
    let A = simplex[2];
    let AB = B.sub(A);
    let AC = C.sub(A);
    let AO = o.sub(A);
    if (lineCase([A,B]) || lineCase([A,C])) { // Line Cases
        return true;
    }
    let ABperp = tripleProd(AC, AB, AB);
    let ACperp = tripleProd(AB, AC, AC);
    if (ABperp.dot(AO) > 0) { //Region AB
        let index = simplex.indexOf(C);
        simplex.splice(index, 1);
        direction = ABperp;
        return false;
    }
    else if (ACperp.dot(AO) > 0) { //Region AC
        let index = simplex.indexOf(B);
        simplex.splice(index, 1);
        direction = ACperp;
        return false;
    }
    return true;
}

function handleSimplex(simplex) {
    if (simplex.length == 2) {
        return lineCase(simplex);
    }
    return triangleCase(simplex);
}

function support(s1, s2){
    return s1.furthestPoint(direction).sub(s2.furthestPoint(direction.neg()));
}

function GJK(s1, s2) {
    direction = (s2.pos.sub(s1.pos)).normalize();
    let simplex = [support(s1, s2)];
    direction = o.sub(simplex[0]);
    while (true) {
        let A = support(s1, s2);
        let product = A.dot(direction);
        if (product < 0) {
            return false;
        }
        simplex.push(A);
        if (handleSimplex(simplex)) {
            s1.colliding = true;
            s2.colliding = true;
            return true;
        }
    }
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

function randint(min, max) {
    return Math.floor(Math.random() * (max+1-min) + min);
}

function getMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top; 
    return [x,y];
}

function startDrag(pos) {
    let endloop = false;
    let mousex = pos[0];
    let mousey = mousePos[1];
    mousePos = pos;

    objects.forEach(object => {
        if(endloop){ return; }
        if((-GRABRADIUS <= object.pos.x - mousex  && object.pos.x - mousex <= GRABRADIUS) && (-GRABRADIUS <= object.pos.y - mousey  && object.pos.y - mousey <= GRABRADIUS)) { 
            selected = object; 
            endloop = true;
            mouseDown = true;
        }
    });
}

function drag(pos) {
    mousePos = pos;
}

function endDrag() {
    mouseDown = false;
    selected = null;
}

canvas.addEventListener('mousedown', event => {
    startDrag(getMousePos(event));
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

function resetSim() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    screenOffset = width*.1;
    objects = [new Circle(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Triangle(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Square(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Pentagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Hexagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Heptagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
               new Octagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset))];

    angle = 0
    selected = null;
    direction = new Vector3(0,0);
    o = new Vector3(0,0);
    mouseDown = false;
}


function simulate() {

    for (let i = 0; i < objects.length; i++) {
        objects[i].colliding = false;
    }

    if (selected != null) {
        selected.translate(new Vector3(mousePos[0], mousePos[1]).sub(selected.pos));
    }

    let pairs = combinations(objects);
    // Number of combinations is equal to n choose 2 where n is the number of objects in the scene
    for (let i = 0; i < pairs.length; i++) {
        GJK(pairs[i][0], pairs[i][1]);
    }

    for (let i = 0; i < objects.length; i++) {
        objects[i].rotate(0.01)
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < objects.length; i++) {
        objects[i].display(objects[i].colliding ? GREEN : BLACK);
    }
}

function update() {
    draw();
    simulate()
    requestAnimationFrame(update);
}

resetSim();
update();