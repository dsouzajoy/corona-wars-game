console.log("spacewars connected...");

/**
AUTHOR: JOY DSOUZA
GITHUB: https://github.com/dsouzajoy
The first function to run is drawStartScreen();
entire flow starts from drawStartScreen();
**/

var canvas = document.getElementById("playground");
canvas.style.backgroundColor = "#000";
var ctx = canvas.getContext("2d");

const AMMO_CAPACITY = 20
const WEAPON_RELOAD_TIME = 200;
const SHIP_STEP = 5;
const VIRUS_RADIUS = 5;
const VIRUS_SPIKES = 15;
const VIRUS_INSET = 3;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 10;
const INITIAL_LIFE = 1;
    
var shipPosition = canvas.width/2;
var rightPressed = false;
var leftPressed = false;
var activeAmmo = [];
var ammoCount = AMMO_CAPACITY;
var activeVirus = [{x: 40, y: 0}];
var impactSound = new Audio("./sounds/brickImpact.wav");
var gameOverSound = new Audio("./sounds/gameOver.wav");
var lives = INITIAL_LIFE;
var kills = 0; 
var virusSpawnInterval;
var backgroundImg = new Image();
var killRecord = parseInt(localStorage.getItem("killRecord"));
if (!killRecord) {killRecord = 0;} ;


function drawShip() {
    ctx.beginPath();
    ctx.fillStyle="#0072bc";
    ctx.rect(shipPosition, canvas.height - 30, 10, 10);
    ctx.rect(shipPosition-10, canvas.height - 30, 10, 10);
    ctx.rect(shipPosition+10, canvas.height - 30, 10, 10);
    ctx.rect(shipPosition, canvas.height - 40, 10, 10);
    ctx.fill();
    ctx.closePath();
}

function drawVirus(virus) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle="#90ee90";
    ctx.translate(virus.x, virus.y);
    ctx.moveTo(0, 0 - VIRUS_RADIUS);
    for(var i = 0; i < VIRUS_SPIKES; i++){
        ctx.rotate(Math.PI / VIRUS_SPIKES);
        ctx.lineTo(0, 0 - (VIRUS_RADIUS * VIRUS_INSET));
        ctx.rotate(Math.PI / VIRUS_SPIKES);
        ctx.lineTo(0, 0 - VIRUS_RADIUS);
    }
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    virus.y += 1;
}

function drawBullets(ammo) {
        ctx.beginPath();
        ctx.rect(ammo.x, ammo.y, BULLET_WIDTH, BULLET_HEIGHT);
        ctx.fillStyle="#0072bc";
        ctx.fill();
        ctx.closePath();
        ammo.y -= 5;
}

function drawGamerOverScreen() {
    gameOverSound.play();
    clearInterval(virusSpawnInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.font = "28px '8bit'";
    ctx.fillStyle = "#efee90";
    ctx.fillText("Game Over", canvas.width/2, canvas.height/2 -20);
    ctx.font = "16px '8bit'";
    ctx.fillText("Corona virus", canvas.width/2, canvas.height/2 + 30);
    ctx.fillText("has reached Earth", canvas.width/2, canvas.height/2 + 50);
    ctx.fillText(`You Killed ${kills} viruses`, canvas.width/2, canvas.height/2 + 80);
    if(kills > killRecord) {
        ctx.font = "12px '8bit'";
        ctx.fillText("Congratulations!",  canvas.width/2, canvas.height/2 + 100);
        ctx.fillText(" You set a new kill record",  canvas.width/2, canvas.height/2 + 120);
        localStorage.setItem("killRecord", kills);
    }
    ctx.font = "12px '8bit";
    ctx.fillText("Press Enter to restart game", canvas.width/2, canvas.height/2 + 150);
    ctx.font = "11px '8bit";
    ctx.fillText("Created by the bored brain of Joy Dsouza", canvas.width/2, 20);
    document.addEventListener("keyup", (e) => { e.key == "Enter" ? document.location.reload() : "s"});
}

function shoot() {
    if(ammoCount) {
            activeAmmo.push({x: shipPosition + 2.5, y: canvas.height - 40});
            ammoCount -= 1;
            if(ammoCount == 0) {
                setTimeout(() => {
                    ammoCount = AMMO_CAPACITY
                }, WEAPON_RELOAD_TIME);
            }
        }
}

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "D" || e.key == "d") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft" || e.key == "A" || e.key == "a") {
        leftPressed = true;
    } else if (e.key == "Up" || e.key == "ArrowUp" || e.key == "W" || e.key == "w") {
        shoot();
    }
}

function keyUpHandler(e) {
     if(e.key == "Right" || e.key == "ArrowRight" || e.key == "D" || e.key == "d") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft" || e.key == "A" || e.key == "a") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.width + 30;
    if(relativeX > 0 && relativeX < canvas.width){
        shipPosition = relativeX;
    }
}

function drawLives() {
    ctx.font = "16px '8bit'";
    ctx.fillStyle = "#ee9090";
    ctx.fillText("\u2665:" + lives, canvas.width - 80, 25);
}

function drawKills() {
    ctx.font = "16px '8bit'";
    ctx.fillStyle = "#fff";
    ctx.fillText("Kills :" + kills, 15, 25);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    activeVirus.forEach((virus, index) => {
        drawVirus(virus);
        if(virus.y == canvas.height) {
            activeVirus.splice(index, 1);
            lives -= 1;
        }
    });
    activeAmmo.forEach(ammo => {
        drawBullets(ammo);
        if(ammo.y == 30) {
            activeAmmo.shift();
        }
    });
    drawShip();
    drawKills();
    drawLives();
    colisionDetection();
    if(rightPressed){
        shipPosition += SHIP_STEP;
        if(shipPosition > canvas.width - 30) { //30 is fixed ship length
            shipPosition = canvas.width - 30;
        }
    }else if(leftPressed){
        shipPosition -= SHIP_STEP;
        if(shipPosition < 20) {
            shipPosition = 20;
        }
    }

    if(lives > 0) {
        requestAnimationFrame(draw);
    } else {
       drawGamerOverScreen();
    }
}

function colisionDetection() {
    activeAmmo.forEach((ammo, aIndex) => {
        activeVirus.some((virus, vIndex) => {
            if(ammo.y < virus.y && (ammo.x + BULLET_WIDTH) >= (virus.x - (VIRUS_RADIUS * 2) - VIRUS_INSET) && ammo.x <=  (virus.x + (VIRUS_RADIUS * 2) + VIRUS_INSET) ) {
                impactSound.play();
                kills += 1;
                activeVirus.splice(vIndex, 1);
                activeAmmo.splice(aIndex, 1);
            }
        })
    })
}

function drawStartScreen() {
    ctx.save();
    ctx.font = "42px '8bit'";
    ctx.textAlign = "center";
    ctx.fillStyle = "#efee90";
    ctx.fillText("Corona Wars", canvas.width/2, 90);
    ctx.font = "22px '8bit'";
    ctx.fillText("Corona Empire has", canvas.width/2, 140);
    ctx.fillText("entered our solar system", canvas.width/2, 165);
    ctx.fillText("Destroy it before", canvas.width/2, 190);
    ctx.fillText("it reaches Earth", canvas.width/2, 215);
    ctx.font = "12px '8bit'";
    ctx.fillText("\u2190 or A : Move Left  |  \u2192 or D - Move Right  |  \u2191 or W - Shoot", canvas.width/2, 240);
    ctx.fillText("Mouse: drag to move click to shoot", canvas.width/2, 260);
    ctx.font = "16px '8bit'";
    ctx.fillText("Click to begin", canvas.width/2, 300);
    ctx.restore();
    document.addEventListener("click", gameOn);
    document.addEventListener("keydown", gameOn);
}

function gameOn() {
    document.removeEventListener("click", gameOn);
    document.removeEventListener("keydown", gameOn);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("click", shoot);
    draw();
    virusSpawnInterval = setInterval(() => {
        var positionX = Math.floor(Math.random() * canvas.width);
        if(positionX < 40) {
            positionX = 40;
        } else if (positionX > canvas.width - 40) {
            positionX = canvas.width - 40;
        }
        activeVirus.push({x: positionX, y:0, type: 1});
    }, 1000)
}

drawStartScreen();



