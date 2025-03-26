const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
const ctx = canvas.getContext("2d");	
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

const BLACK = "#141414";
const tetrahedron = [[-200,-115.47005384,-81.64965809],[200,-115.47005384,-81.64965809],[0,230.94010767000003,-81.64965809],[0,0,244.94897428000002],[200,-115.47005384,-81.64965809],[0,0,244.94897428000002],[-200,-115.47005384,-81.64965809],[0,0,244.94897428000002],[0,230.94010767000003,-81.64965809],[-200,-115.47005384,-81.64965809]];
const cube = [[150,150,150],[-150,150,150],[-150,150,-150],[150,150,-150],[150,150,150],[150,-150,150],[150,-150,-150],[150,150,-150],[150,-150,-150],[-150,-150,-150],[-150,150,-150],[-150,-150,-150],[-150,-150,150],[-150,150,150],[-150,-150,150],[150,-150,150]];
const octahedron = [[200,0,0],[0,200,0],[-200,0,0],[0,-200,0],[200,0,0],[0,0,200],[0,200,0],[0,0,200],[-200,0,0],[0,0,200],[0,-200,0],[0,0,-200],[200,0,0],[0,0,-200],[-200,0,0],[0,0,-200],[0,200,0]];
const dodecahedron = [[-77.25424862499999,0,202.2542485875],[-125,-125,125],[0,-202.2542485875,77.25424862499999],[125,-125,125],[77.25424862499999,0,202.2542485875],[-77.25424862499999,0,202.2542485875],[-125,125,125],[0,202.2542485875,77.25424862499999],[125,125,125],[77.25424862499999,0,202.2542485875],[-77.25424862499999,0,202.2542485875],[-125,-125,125],[-202.2542485875,-77.25424862499999,0],[-202.2542485875,77.25424862499999,0],[-125,125,125],[-202.2542485875,77.25424862499999,0],[-125,125,-125],[-77.25424862499999,0,-202.2542485875],[-125,-125,-125],[-202.2542485875,-77.25424862499999,0],[-125,-125,-125],[0,-202.2542485875,-77.25424862499999],[0,-202.2542485875,77.25424862499999],[0,-202.2542485875,-77.25424862499999],[-125,-125,-125],[-77.25424862499999,0,-202.2542485875],[77.25424862499999,0,-202.2542485875],[125,-125,-125],[0,-202.2542485875,-77.25424862499999],[125,-125,-125],[202.2542485875,-77.25424862499999,0],[202.2542485875,77.25424862499999,0],[125,125,-125],[77.25424862499999,0,-202.2542485875],[-77.25424862499999,0,-202.2542485875],[-125,125,-125],[0,202.2542485875,-77.25424862499999],[125,125,-125],[202.2542485875,77.25424862499999,0],[125,125,125],[0,202.2542485875,77.25424862499999],[0,202.2542485875,-77.25424862499999],[0,202.2542485875,77.25424862499999],[125,125,125],[77.25424862499999,0,202.2542485875],[125,-125,125],[202.2542485875,-77.25424862499999,0]];
const icosahedron = [[0,125,202.25424850000002],[-125,202.25424850000002,0],[125,202.25424850000002,0],[0,125,202.25424850000002],[125,202.25424850000002,0],[202.25424850000002,0,125],[0,125,202.25424850000002],[202.25424850000002,0,125],[0,-125,202.25424850000002],[0,125,202.25424850000002],[0,-125,202.25424850000002],[-202.25424850000002,0,125],[0,125,202.25424850000002],[-202.25424850000002,0,125],[-125,202.25424850000002,0],[-202.25424850000002,0,125],[-202.25424850000002,0,-125],[-125,202.25424850000002,0],[-202.25424850000002,0,-125],[0,125,-202.25424850000002],[-125,202.25424850000002,0],[0,125,-202.25424850000002],[125,202.25424850000002,0],[0,125,-202.25424850000002],[202.25424850000002,0,-125],[125,202.25424850000002,0],[202.25424850000002,0,-125],[202.25424850000002,0,125],[202.25424850000002,0,-125],[125,-202.25424850000002,0],[202.25424850000002,0,125],[125,-202.25424850000002,0],[0,-125,202.25424850000002],[125,-202.25424850000002,0],[-125,-202.25424850000002,0],[0,-125,202.25424850000002],[-125,-202.25424850000002,0],[-202.25424850000002,0,125],[-125,-202.25424850000002,0],[-202.25424850000002,0,-125],[-125,-202.25424850000002,0],[0,-125,-202.25424850000002],[-202.25424850000002,0,-125],[0,-125,-202.25424850000002],[0,125,-202.25424850000002],[0,-125,-202.25424850000002],[202.25424850000002,0,-125],[0,-125,-202.25424850000002],[125,-202.25424850000002,0]];

var s = Math.min(width, height) - 1;
var r = 1.0;
var a = [0.0, 0.0, 0.0];
var b = [0.0, 0.0, 0.0];
var mouse_pos = [width / 2, height / 2];
var mouse_down = false;
var last_rot = [1.0, 0.0, 0.0, 0.0];
var current_rot = [1.0, 0.0, 0.0, 0.0];
var origin = [width / 2, height / 2];
const d = 1500;
var shapeMode = "tetrahedron";

var base_points = [];

canvas.addEventListener('mousedown', event => {
  if (event.button == 0) {
    a = [...convertMousePosToTrackball()];
    mouse_down = true;
  }
});

canvas.addEventListener('mouseup', event => {
  if (event.button == 0) {
    last_rot = mulQuat(current_rot, last_rot);
    current_rot = [1.0, 0.0, 0.0, 0.0];
    mouse_down = false;
  }
});

canvas.addEventListener('mouseleave', event => {
  last_rot = mulQuat(current_rot, last_rot);
  current_rot = [1.0, 0.0, 0.0, 0.0];
  mouse_down = false;
});

canvas.addEventListener('mousemove', event => {
  var rect = canvas.getBoundingClientRect();
  mouse_pos = [event.clientX - rect.left, event.clientY - rect.top];
  if (mouse_down) {
    b = convertMousePosToTrackball();
    current_rot = quatFromVectors(a, b)
    draw();
  }
});

window.addEventListener('resize', event => {
  canvas.width = canvasDiv.clientWidth;
  canvas.height = canvasDiv.clientHeight;
  width = canvasDiv.clientWidth;
  height = canvasDiv.clientHeight;
  origin = [width / 2, height / 2];
  draw();
});

function quatFromVectors(v1, v2) {
  let d = dot3DVec(v1, v2);
  let w = cross3DVec(v1, v2);
  return normQuat([d + Math.sqrt(d * d + dot3DVec(w, w)), ...w]);
}

// Assumes length of q is 1
function rotateVectorByQuat(q, v) {
  let t = cross3DVec(mul3DVec(getQuatImg(q), 2), v);
  return add3DVec(add3DVec(v, mul3DVec(t, q[0])), cross3DVec(getQuatImg(q), t));
}

function mulQuat(q1, q2) {
  let n1 = getQuatImg(q1);
  let n2 = getQuatImg(q2);
  return [q1[0]*q2[0] - dot3DVec(n1, n2), ...add3DVec(add3DVec(mul3DVec(n2, q1[0]), mul3DVec(n1, q2[0])), cross3DVec(n1, n2))];
}

function normQuat(q) {
  if (lenQuat(q) == 0) {
    return [0.0, 0.0, 0.0, 0.0];
  }
  return divQuat(q, lenQuat(q));
}

function divQuat(q, scalar) {
  return [q[0]/scalar, q[1]/scalar, q[2]/scalar, q[3]/scalar];
}

function lenQuat(q) {
  return Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
}

function getQuatImg(q) {
  return q.slice(1, 4);
}

function cross3DVec(v1, v2) {
  return [v1[1]*v2[2] - v1[2]*v2[1], v1[2]*v2[0] - v1[0]*v2[2], v1[0]*v2[1] - v1[1]*v2[0]];
}

function dot3DVec(v1, v2) {
  return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

function add3DVec(v1, v2) {
  return [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]];
}

function mul3DVec(v, scalar) {
  return [v[0]*scalar, v[1]*scalar, v[2]*scalar];
}

function convertMousePosToTrackball() {
  var p_x = 1/s*(2*mouse_pos[0] - width + 1);
  var p_y = -1/s*(2*mouse_pos[1] - height + 1);
  var p_z = p_x*p_x + p_y*p_y <= r*r / 2 ? Math.sqrt(r*r - p_x*p_x - p_y*p_y) : r*r / 2 / Math.sqrt(p_x*p_x + p_y*p_y);
  return [p_x, p_y, p_z];
}

function init() {
  shapeMode = document.getElementById("shape").value;
  base_points = [];
  switch (shapeMode) {
    case "tetrahedron": {
      base_points = [...tetrahedron];
      break;
    }
    case "cube": {
      base_points = [...cube];
      break;
    }
    case "octahedron": {
      base_points = [...octahedron];
      break;
    }
    case "dodecahedron": {
      base_points = [...dodecahedron];
      break;
    }
    case "icosahedron": {
      base_points = [...icosahedron];
      break;
    }
  }
}

function drawLine(p1, p2) {
  ctx.beginPath();
  ctx.moveTo(p1[0],p1[1]);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 1;
  ctx.lineTo(p2[0],p2[1]);
  ctx.stroke();
  ctx.closePath();
}

function drawCircle(p, r) {
  ctx.beginPath();
  ctx.fillStyle = BLACK;
  ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
  ctx.fill()
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  let rotation = normQuat(mulQuat(current_rot, last_rot));
  let rotated_points = [];
  let previous_point = [];
  for (let i = 0; i < base_points.length; i++) {
    let r = rotateVectorByQuat(rotation, base_points[i]);
    rotated_points.push([origin[0] + (r[0] / (-d + r[2]) * -d), origin[1] - (r[1] / (-d + r[2]) * -d), r[2] / (-d + r[2]) * -d]);
    if (previous_point.length != 0) {
      drawLine(previous_point, rotated_points[i])
    }
    previous_point = [...rotated_points[i]];
  }
}

function reset() {
  init();
  draw();
}

reset();