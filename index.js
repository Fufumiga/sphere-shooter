//#region Constantes e variaveis globais
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const startPanel = document.getElementById('menu-panel');
const scoreboard = document.getElementById('score-meter');
const menuScore = document.getElementById('menu-score');
const midX = canvas.width / 2;
const midY = canvas.height / 2;
var isStopped = true;
var hasStarted = false;
var score = 0;
//#endregion

//#region Classes
class Vector2 {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /** @type {Vector2} */ static zero = new Vector2(0, 0);
  /** @type {Vector2} */ static up = new Vector2(0, 1);
  /** @type {Vector2} */ static down = new Vector2(0, -1);
  /** @type {Vector2} */ static right = new Vector2(1, 0);
  /** @type {Vector2} */ static left = new Vector2(-1, 0);

  static distance(pointA, pointB) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
  }
}
class Player {
  constructor(x, y, radius, color) {
    this.radius = radius;
    this.color = color;
    this.position = new Vector2(x, y);
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2, false);

    context.fillStyle = this.color;
    context.fill();
  }
}

class Projectile {
  constructor(position, radius, color, velocity) {
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.position = position;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2, false);

    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
}


class Enemy {
  /** @type {Vector2} */ position;
  /** @type {Vector2} */ velocity;
  /** @type {number} */ radius;
  /** @type {number} */ score;
  /** @type {string} */color;

  constructor(position, radius, color, velocity) {
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.position = position;
    this.score = radius;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2, false);

    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
}

class Particle {
  constructor(position, radius, color, velocity) {
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.position = position;
    this.alpha = 1;
  }

  draw() {
    context.save();
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.arc(this.position.x, this.position.y,
      this.radius, 0, Math.PI * 2, false);

    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }

  update() {
    this.draw();
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}
//#endregion

//#region Variáveis do jogo
const player = new Player(midX, midY, 20, 'white');
var projectiles = [];
var enemies = [];
var particles = [];
var animationID;
var enemySpawnInterval;
//#endregion

//#region Funções
addEventListener('click', (event) => onMouseClick(event));

function getAngleToMidScreen(x, y) {
  const yDistance = y - midY;
  const xDistance = x - midX;

  return Math.atan2(yDistance, xDistance);
}

function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnEnemies() {
  enemySpawnInterval = setInterval(() => {

    const radius = getRandomBetween(9, 60);

    const randomColor = Math.random() * 360;
    const color = 'hsl(' + randomColor + ',50%,50%)';

    var x;
    var y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }


    const angle = Math.atan2(midY - y, midX - x);

    const velocity = new Vector2(Math.cos(angle), Math.sin(angle));

    const position = new Vector2(x, y);
    var enemy = new Enemy(position, radius, color, velocity);

    enemies.push(enemy);
  }, 900);

}

function checkDistanceToProjectiles(enemy, enIndex) {
  projectiles.forEach((projectile, prIndex) => {
    const dist = Vector2.distance(projectile.position, enemy.position);

    if (dist - enemy.radius - projectile.radius < 1) {
      setTimeout(() => { //previne um "flash" quando inimigo é destruído
        projectiles.splice(prIndex, 1);
        spawnParticles(projectile, enemy.color);
        hit(enemy, enIndex);
      }, 0)
    }
  });
}

function hit(enemy, index) {

  if (enemy.radius > 30) {
    gsap.to(enemy, {
      radius: enemy.radius - 20
    });
  } else {
    updateScore(enemy.score);
    enemies.splice(index, 1);
  }
}

function updateScore(enemyScore) {
  let pointsLabel = document.getElementById("score-label");
  score = score + Math.floor(enemyScore);
  pointsLabel.innerHTML = score;
}

function spawnParticles(projectile, enemyColor) {
  for (let index = 0; index < 10; index++) {
    const velocity = new Vector2((Math.random() - 0.5) * Math.random() * 5, 
    (Math.random() - 0.5) * Math.random() * 5);
    let particle = new Particle(new Vector2(projectile.position.x, projectile.position.y),
      3, enemyColor, velocity);
    
    particles.push(particle);
  }
}

function updateEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.update();
    const distToPlayer = Vector2.distance(player.position, enemy.position);

    //Enemy hitting player
    if (distToPlayer - enemy.radius - player.radius < 0.7) {
      endGame();
    }

    checkDistanceToProjectiles(enemy, index);
  })
}

function updateProjectiles() {
  projectiles.forEach((projectile, index) => {
    projectile.update();

    if (projectile.position.x - projectile.radius < 0 ||
      projectile.position.x - projectile.radius > canvas.width ||
      projectile.position.y + projectile.radius < 0 ||
      projectile.position.y - projectile.radius > canvas.height) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0)
    }
  });
}

function updateParticles() {
  particles.forEach((particle, index) => {
    if(particle.alpha > 0){
      particle.update();
    } else {
      particles.splice(index,1);
    }
  });
}


function animate() {
  animationID = requestAnimationFrame(animate);
  context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();

  updateParticles();
  updateProjectiles();
  updateEnemies();

}

function restartArrays() {
  projectiles = [];
  particles = [];
  enemies = [];
}

function onMouseClick(event) {
  if(isStopped) return;

  console.log(projectiles);
  const angle = getAngleToMidScreen(event.clientX, event.clientY);
  const velocity = new Vector2();
  velocity.x = Math.cos(angle) * 5;
  velocity.y = Math.sin(angle) * 5;

  const projectile = new Projectile(new Vector2(midX, midY),
    7, 'white', velocity);

  projectiles.push(projectile);
}


function resetScore() {
  score = 0;
  document.getElementById("score-label").innerHTML = "0";
}

function startGame() {
  if (hasStarted) restartArrays();
  resetScore();
  animate();
  spawnEnemies();
  startPanel.className = "hidden";
  scoreboard.className = "";
  
  hasStarted = true;
  isStopped = false;
}

function endGame() {
  cancelAnimationFrame(animationID);
  clearInterval(enemySpawnInterval);
  isStopped = true;
  startPanel.className = "";
  scoreboard.className = "hidden";
  startPanel.className = "";
  menuScore.innerHTML = score;
  document.getElementById("header").innerHTML = "GAME OVER";
}
//#endregion