class Vector2 {
    constructor(x, y=null) {
        this.x = x;
        if (y != null) {
            this.y = y;
        }
        else {
            this.y = x;
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
        return this.x * v.x + this.y * v.y;
    };
    dot2() {
        return this.dot(this);
    };
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
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
        return new Vector2(this.x * Math.cos(theta) - this.y * Math.sin(theta), this.x * Math.sin(theta) + this.y * Math.cos(theta));
    };
    equals(v) {
        return this.x == v.x && this.y == v.y;
    };
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    };
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    };
    neg() {
        return new Vector2(-this.x, -this.y);
    };
    div(n) {
        return new Vector2(this.x / n, this.y / n);
    };
    mul(n) {
        return new Vector2(this.x * n, this.y * n);
    };
    toString() {
        return "(".concat(this.x, ",").concat(this.y, ")");
    };
}
