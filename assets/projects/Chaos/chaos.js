const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

var attactorMode;
var axisMode;
var initialPoints;
var dt;
var xmin, xmax;
var ymin, ymax;
var zmin, zmax;
var colors;
var previousPoints;

function initializeAttactorVars() {
    switch (attactorMode) {
        case "thomas":
            initialPoints = [[1.1, 1.1, -0.01]];
            dt = 0.1;
            xmin = -10;
            xmax = 10;
            ymin = -10;
            ymax = 10;
            zmin = -10;
            zmax = 10;
            break;

        case "lorenz":
            initialPoints = [[1.1, 2.0, 7.0]];
            dt = 0.007;
            xmin = -50;
            xmax = 50;
            ymin = -50;
            ymax = 50;
            zmin = -50;
            zmax = 50;
            break;

        case "aizawa":
            initialPoints = [[0.1, 1, 0.01]];
            dt = 0.01;
            xmin = -3;
            xmax = 3;
            ymin = -3;
            ymax = 3;
            zmin = -3;
            zmax = 3;
            break;

        case "dadras":
            initialPoints = [[1.1, 2.1, -2.0]];
            dt = 0.01;
            xmin = -20;
            xmax = 20;
            ymin = -20;
            ymax = 20;
            zmin = -20;
            zmax = 20;
            break;
    
        case "chen":
            initialPoints = [[5.0, 10.0, 10.0], [-7.0, -5.0, -10.0]];
            dt = 0.007;
            xmin = -20;
            xmax = 20;
            ymin = -20;
            ymax = 20;
            zmin = -20;
            zmax = 20;
            break;
    
        case "rossler":
            initialPoints = [[10.0, 0.0, 10.0]];
            dt = 0.02;
            xmin = -25;
            xmax = 25;
            ymin = -25;
            ymax = 25;
            zmin = -25;
            zmax = 25;
            break;
        
        case "halvorson":
            initialPoints = [[-1.48, -1.51, 2.04]]
            dt = 0.009
            xmin = -20;
            xmax = 20;
            ymin = -20;
            ymax = 20;
            zmin = -20;
            zmax = 20;
            break;
    
        case "rab_fab":
            initialPoints = [[-1.0, 0.0, 0.5],[1.1, 0.0, 0.5]];
            dt = 0.025;
            xmin = -5;
            xmax = 5;
            ymin = -5;
            ymax = 5;
            zmin = -5;
            zmax = 5;
            break;
    
        case "tsucs":
            initialPoints = [[-0.29, -0.25, -0.59]];
            dt = 0.0004;
            xmin = -300;
            xmax = 300;
            ymin = -300;
            ymax = 300;
            zmin = -300;
            zmax = 300;
            break;
    
        case "fourwings":
            initialPoints = [[1.3, -0.18, 0.01]];
            dt = 0.06;
            xmin = -5;
            xmax = 5;
            ymin = -5;
            ymax = 5;
            zmin = -5;
            zmax = 5;
            break;

        default:
             break;
    }
}

function randint(min, max) {
    return Math.floor(Math.random() * (max+1-min) + min);
}

window.addEventListener('resize', event => {
    resetSim();
});

function resetSim(){
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    attactorMode = document.getElementById("attractor").value;
    axisMode = document.getElementById("axis").value;

    initializeAttactorVars();

    colors = [];
    previousPoints = []
    for (let i = 0; i < initialPoints.length; i++){
        colors.push("#"+parseInt(randint(50, 255), 16)+""+parseInt(randint(50, 255), 16)+""+parseInt(randint(50, 255), 16));
        previousPoints.push(initialPoints[i]);
    }

}

function attractor(p) {
    switch (attactorMode) {
        case "lorenz": return lorenz(p)
        case "thomas": return thomas(p)
        case "aizawa": return aizawa(p)
        case "dadras": return dadras(p)
        case "chen": return chen(p)
        case "rossler": return rossler(p)
        case "halvorson": return halvorson(p)
        case "rab_fab": return rab_fab(p)
        case "tsucs": return tsucs(p)
        case "fourwings": return fourwings(p)
    }
}

// All the formulas and their starting conditions were taken from https://www.dynamicmath.xyz/strange-attractors/
// The min and max as well as the dt values are taken from what I thought looked best for each
// dx, dy, and dz, are the technically derivatives of those axies with respect to time
function lorenz(p, a=10, b=28, c=2.667) {
    let dx = a * (p[1] - p[0]);                                                  // a(y-x)
    let dy = b * p[0] - p[1] - p[0] * p[2];                                      // bx-y-xz
    let dz = p[0] * p[1] - c * p[2];                                             // xy-cz
    
    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

function thomas(p, b=0.208186) {
    let dx = Math.sin(p[1]) - b*p[0];                                            // sin(y)-bx
    let dy = Math.sin(p[2]) - b*p[1];                                            // sin(z)-by
    let dz = Math.sin(p[0]) - b*p[2];                                            // sin(x)-bz
    
    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

function aizawa(p, a=0.95, b=0.7, c=0.6, d=3.5, e=0.25, f=0.1) {
    let dx = (p[2]-b)*p[0]-d*p[1];                                               // (z-b)x-dy
    let dy = d*p[0]+(p[2]-b)*p[1];                                               // dx+(z-b)y
    let dz = c+a*p[2]-p[2]**3/3-(p[0]**2+p[1]**2)*(1+e*p[2])+f*p[2]*(p[0]**3);   // c+az-(z^3)/3-(x^2+y^2)(1+ez)+fz(x^3)
    
    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

function dadras(p, a=3, b=2.7, c=1.7, d=2, e=9) {
    let dx = p[1]-a*p[0]+b*p[1]*p[2];                                            // y-ax+byz
    let dy = c*p[1]-p[0]*p[2]+p[2];                                              // cy-xz+z
    let dz = d*p[0]*p[1]-e*p[2];                                                 // dxy-ez
    
    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

function chen(p, a=5.0, b=-10.0, c=-0.38) {
    let dx = a*p[0]-p[1]*p[2];                                                   // ax-yz
    let dy = b*p[1]+p[0]*p[2];                                                   // by+xz
    let dz = c*p[2]+p[0]*p[1]/3;                                                 // cz+xy/3

    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

function rossler(p, a=0.2, b=0.2, c=5.7) {
    let dx = -(p[1]+p[2]);                                                       // -(y+z)
    let dy = p[0]+a*p[1];                                                        // x+ay
    let dz = b+p[2]*(p[0]-c);                                                    // b+z(x-c)
    
    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

function halvorson(p, a=1.89) {
    let dx = -a*p[0]-4*p[1]-4*p[2]-p[1]**2;                                      // ax-4y-4z-y^2
    let dy = -a*p[1]-4*p[2]-4*p[0]-p[2]**2;                                      // ay-4z-4x-z^2
    let dz = -a*p[2]-4*p[0]-4*p[1]-p[0]**2;                                      // az-4x-4y-x^2
    
    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

// RABINOVICH-FABRIKANT
function rab_fab(p, a=0.14, b=0.10) {
    let dx = p[1]*(p[2]-1+p[0]**2)+b*p[0];                                       // y(z-1+x^2)+bx
    let dy = p[0]*(3*p[2]+1-p[0]**2)+b*p[1];                                     // x(3z+1-x^2)+by
    let dz = -2*p[2]*(a+p[0]*p[1]);                                              // -2z(a+xy)

    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

// THREE-SCROLL UNIFIED CHAOTIC SYSTEM
function tsucs(p, a=32.48, b=45.84, c=1.18, d=0.13, e=0.57, f=14.7) {
    let dx = a*(p[1]-p[0])+d*p[0]*p[2];                                          // a(y-x)+dxz
    let dy = b*p[0]-p[0]*p[2]+f*p[1];                                            // bx-xz+fy
    let dz = c*p[2]+p[0]*p[1]-e*p[0]**2;                                         // cz+xy-ex^2

    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt];
}

function fourwings(p, a=0.2, b=0.01, c=-0.4) {
    let dx = a*p[0]+p[1]*p[2];                                                   // ax+yz
    let dy = b*p[0]+c*p[1]-p[0]*p[2];                                            // bx+cy-xz
    let dz = -p[2]-p[0]*p[1];                                                    // -z-xy
    
    return [p[0]+dx*dt, p[1]+dy*dt, p[2]+dz*dt]
}

function toScreenCoords(p) {
    switch (axisMode) {
        case "XY": return xy_screen_coords(p);
        case "XZ": return xz_screen_coords(p);
        case "YX": return yx_screen_coords(p);
        case "YZ": return yz_screen_coords(p);
        case "ZX": return zx_screen_coords(p);
        case "ZY": return zy_screen_coords(p);
    }
}

//The first named axis is displayed on the screen as the x axis and the second the y axis
function xy_screen_coords(p) {
    let screenx = width * ((p[0] - xmin) / (xmax - xmin));
    let screeny = height * ((p[1] - ymin) / (ymax - ymin));

    return [Math.round(screenx), Math.round(screeny)];
}

function yx_screen_coords(p) {
    let screenx = height * ((p[0] - xmin) / (xmax - xmin));
    let screeny = width * ((p[1] - ymin) / (ymax - ymin));

    return [Math.round(screeny), Math.round(screenx)];
}

function yz_screen_coords(p) {
    let screenz = width * ((p[2] - zmin) / (zmax - zmin));
    let screeny = height * ((p[1] - ymin) / (ymax - ymin));

    return [Math.round(screenz), Math.round(screeny)];
}

function zy_screen_coords(p) {
    let screenz = height * ((p[2] - zmin) / (zmax - zmin));
    let screeny = width * ((p[1] - ymin) / (ymax - ymin));

    return [Math.round(screeny), Math.round(screenz)];
}

function xz_screen_coords(p) {
    let screenx = width * ((p[0] - xmin) / (xmax - xmin));
    let screenz = height * ((p[2] - zmin) / (zmax - zmin));

    return [Math.round(screenx), Math.round(screenz)];
}

function zx_screen_coords(p) {
    let screenx = height * ((p[0] - xmin) / (xmax - xmin));
    let screenz = width * ((p[2] - zmin) / (zmax - zmin));

    return [Math.round(screenz), Math.round(screenx)];
}

function updateAndDraw() {
    for (let i = 0; i < initialPoints.length; i++){
        let next = attractor(previousPoints[i]);
        let screenCoords = toScreenCoords(next);
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.arc(screenCoords[0], screenCoords[1], 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        previousPoints[i] = next;
    }
    requestAnimationFrame(updateAndDraw);
}

resetSim();
updateAndDraw();