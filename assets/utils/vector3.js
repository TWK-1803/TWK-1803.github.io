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