// Groooo!
//
// A simple "eating stuff" game.
//
// Author: Tamás Gál - https://github.com/tamasgal/groooo
//

var canvas;
var world = {"width": 3000, "height": 3000};
var nEnemies = 500;
var ctx;
var target = new Point(0, 0);
var targetPointer = new TargetPointer(target.x, target.y);
var thrust = new Thrust(0, 0);
var avatar;
var drag = false;
var enemies = [];
var pos = new Point(0, 0);
var gameOver = false;
var startTime = + new Date();
var endTime;
var clicks = 0;
var inContact = false;
var zoom = 1;
var zooming = false;
var outro = false;

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", startDrag);
    canvas.addEventListener("mousemove", mouseMoved);
    canvas.addEventListener("mouseup", stopDrag);
    canvas.addEventListener("click", mouseClicked);

    avatar = new Avatar();

    initialise();


    var fps = 30.;
    setInterval(update, 1000/fps);
    zoomTo(7/Math.sqrt(avatar.r));
}

function initialise() {
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    createMap();
}

function createMap()  {
    var iterations = 0;
    for(i=0; i<nEnemies; i++) {
        console.log("creating enemy");
        var x, y, z;
        var ok = false;
        while(!ok) {
            iterations += 1;
            x = world.width*Math.random() - world.width/2;
            y = world.width*Math.random() - world.width/2;
            //r = Math.floor(9 + Math.random()*40);
            var rnd = 1 + Math.random() * 8;
            r = 3 + Math.pow(2, rnd);
            if(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) < r + avatar.r) {
                continue;
            }

            if(enemies.length == 0) {
                ok = true;
            }
            for(i=0; i<enemies.length; i++) {
                var e = enemies[i];
                var dist = Math.sqrt(Math.pow(e.x - x, 2) + Math.pow(e.y - y, 2));
                if(dist < (e.r + r)) {
                    ok = false;
                    break;
                } else {
                    ok = true;
                }
            }
            if(ok) {
                enemies.push( new Enemy(x, y, r) );
                break;
            }
        }
    }
    console.log("Map created after " + iterations + " iterations.");
}

function drawCanvas() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#f2eded';
    ctx.strokeStyle = 'white';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    // ctx.strokeRect((-world.width/2 + canvas.width/2)*zoom - pos.x*zoom,
    //                (-world.height/2 + canvas.height/2)*zoom - pos.y*zoom,
    //                (world.width * zoom), (world.height * zoom));
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function checkBoundaries() {
    if(pos.x > (world.width/2 - avatar.r)) {
        avatar.dx = Math.abs(avatar.dx);
    }
    if(pos.x < (-world.width/2 + avatar.r)) {
        avatar.dx = -Math.abs(avatar.dx);
    }
    if(pos.y > (world.height/2 - avatar.r) ) {
        avatar.dy = Math.abs(avatar.dy);
    }
    if(pos.y < -world.height/2 + avatar.r) {
        avatar.dy = -Math.abs(avatar.dy);
    }
}

function update() {
    if(isNaN(avatar.r) || avatar.r < 2) {
        gameOver = true;
    }
    if(gameOver) {
        alert("Game Over");
        return;
    }
    drawCanvas();
    thrust.draw();

    checkBoundaries();

    var smallest = true;
    var biggest = true;

    for(i=enemies.length-1; i>=0; i--) {
        var e = enemies[i];

        if(e.r <= avatar.r) {
            smallest = false;
        } else {
            biggest = false;
        }

        e.draw();


        var dist = Math.sqrt(
            Math.pow(e.x - pos.x, 2) + Math.pow(e.y - pos.y, 2)
        );
        if(dist < avatar.r + e.r) {
            inContact = true;
            //var Ekin = 1/2 * Math.pow(avatar.r, 2) * Math.PI * ...;
            var diff = Math.abs(dist - avatar.r - e.r);
            var extraA = Math.pow(diff, 2) * Math.PI;
            var A = Math.pow(avatar.r, 2) * Math.PI;
            var AE = Math.pow(e.r, 2) * Math.PI;
            if(avatar.r < e.r) {
                var newA = A - extraA;
                var newAE = AE + extraA;
            } else {
                var newA = A + extraA;
                var newAE = AE - extraA;
            }
            avatar.r = Math.sqrt(newA/Math.PI);
            // if(avatar.r + pos.x > world.width/2) {
            //     pos.x -= world.width/2 - avatar.r;
            // }
            // if(pos.x - avatar.r < -world.width/2) {
            //     pos.x += -world.width/2 + avatar.r;
            // }
            // if(avatar.r + pos.y > world.height/2) {
            //     pos.y -= world.height/2 - avatar.r;
            // }
            // if(pos.y - avatar.r < -world.height/2) {
            //     pos.y += -world.height/2 + avatar.r;
            // }
            e.r = Math.sqrt(newAE/Math.PI);

            if(isNaN(e.r) || e.r < 2) {
                enemies.splice(i, 1);
            }

            if(!zooming) {
                zoomTo(7/Math.sqrt(avatar.r));
            }
        } else {
            inContact = false;
        }
    }

    if(!outro && biggest) {
        endTime = + new Date();
        alert("Well done, you are the one!");
        alert("Total time: " + (endTime - startTime) / 1000 + 
              " sec\nFinal radius: " + Math.floor(avatar.r) + "\n" +
              "Number of clicks: " + clicks);
        outro = true;
    }

    pos.x -= avatar.dx / 4;
    pos.y -= avatar.dy / 4;

    avatar.draw();
    targetPointer.draw();
}

function zoomTo(z) {
    zooming = true;
    var diff = z - zoom;
    var n = 100;
    var step = diff / 100;
    var i = 0;
    var zoomer = setInterval(function() {
        i++;
        zoom += step;
        if(i == n) {
            clearInterval(zoomer);
            zooming = false;
        }
    }, 10);
}

function startDrag(evt) {
    drag = true;
}

function stopDrag(evt) {
    drag = false;
}

function mouseMoved(evt) {
    return;
    if(drag) {
        target.x = evt.offsetX - canvas.width/2 + pos.x;
        target.y = evt.offsetY - canvas.height/2 + pos.y;
        targetPointer.x = evt.offsetX;
        targetPointer.y = evt.offsetY;
        targetPointer.refresh();
    }
}

function mouseClicked(evt) {
    clicks += 1;
    
    target.x = evt.clientX - canvas.width/2 + pos.x;
    target.y = evt.clientY - canvas.height/2 + pos.y;

    var dir = new Point(target.x - pos.x, target.y - pos.y);
    var distance = Math.sqrt(Math.pow(dir.x, 2) + Math.pow(dir.y, 2));
    if(distance > 0) {
        avatar.dx += dir.x/distance;
        avatar.dy += dir.y/distance;
        avatar.r *= 0.993;
        thrust.dx = dir.x/distance;
        thrust.dy = dir.y/distance;
        thrust.refresh();
    }

    console.log(target);
    targetPointer.x = evt.clientX;
    targetPointer.y = evt.clientY;
    targetPointer.refresh();
}
