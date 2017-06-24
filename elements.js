var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

var Avatar = function() {
    this.r = 7;
    this.dx = 0;
    this.dy = 0;

    this.draw = function() {
        var x = canvas.width/2;
        var y = canvas.height/2;
        ctx.fillStyle = '#336699';
        ctx.beginPath();
        ctx.arc(x, y, this.r*zoom, 0, 2*Math.PI);
        ctx.fill();
    }
}

var Enemy = function(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = '#f55b5b';

    this.draw = function() {
        var x = this.x*zoom + canvas.width/2 - pos.x*zoom;
        var y = this.y*zoom + canvas.height/2 - pos.y*zoom;

        var c = this.c;
        if(this.r < avatar.r) {
            c = '#66cdaa';
        }

        ctx.beginPath();
        ctx.fillStyle = c;
        ctx.arc(x, y, this.r*zoom, 0, 2*Math.PI);
        ctx.fill();
    }
}

var TargetPointer = function(x, y) {
    this.alpha = 0.0;
    this.time = 0;
    this.duration = 100;  // [ms]
    this.r = 10;
    this.x = x;
    this.y = y;

    this.draw = function() {
        var t = + new Date() - this.time;
        var d = this.duration;
        var r = this.r - this.r*t/d
        if(drag) {
            r = 3;
        }
        if(t < this.duration && r > 1) {
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.arc(this.x, this.y, r, 0, 2*Math.PI);
            ctx.stroke();
        }
    }

    this.refresh = function() {
        this.time = + new Date();
    }
}

var Thrust = function(dx, dy) {
    this.dx = dx;
    this.dy = dy;
    this.time = 0;
    this.duration = 80;  // [ms]

    this.draw = function() {
        var t = + new Date() - this.time;
        var d = this.duration;

        if(t > d) {
            return;
        }

        var sx = canvas.width/2;
        var sy = canvas.height/2;
        var ex = sx + this.dx * avatar.r * 2 * t / d;
        var ey = sy + this.dy * avatar.r * 2 * t / d;

        ctx.beginPath();
        ctx.strokeStyle = 'gray';
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    }

    this.refresh = function() {
        this.time = + new Date();
    }
}

