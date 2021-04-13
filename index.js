var game = {};
game.restart = () => {};

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
var isStopped;

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
    return Math.sqrt((pointA.x-pointB.x)**2 + (pointA.y-pointB.y)**2 );
  }
}
class Player {
  constructor(x, y, radius, color) {
    this.radius = radius;
    this.color = color;
    this.position = new Vector2(x,y);
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, 
      this.radius, 0, Math.PI*2, false);
    
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
      this.radius, 0, Math.PI*2, false);
    
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
  constructor(position, radius, color, velocity) {
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.position = position;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, 
      this.radius, 0, Math.PI*2, false);
    
    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
}

const midX = canvas.width / 2;
const midY = canvas.height / 2;

const player = new Player(midX, midY, 20, 'white');

var projectiles = [];
var enemies = [];
var animationID;

function getAngleToMidScreen(x,y) {
  const yDistance = y - midY;
  const xDistance = x - midX;

  return Math.atan2(yDistance,xDistance);
}

function getRandomBetween(min,max) {
  return Math.random() * (max - min) + min;
}

function spawnEnemies() {
  
  setInterval(() => {
    const radius = getRandomBetween(9,20);

    const randomColor = Math.random() * 360;
    const color = 'hsl(' + randomColor + ',50%,50%)';
    
    var x;
    var y;
    
    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0-radius : canvas.width+radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0-radius : canvas.height+radius;
    }
    
    
    const angle = Math.atan2(midY - y, midX - x);
    
    const velocity = new Vector2(Math.cos(angle), Math.sin(angle));
    
    const position = new Vector2(x,y);
    var enemy = new Enemy(position,radius,color,velocity);
    
    enemies.push(enemy);
  }, 1000 );
  
}

function checkDistanceToProjectiles(enemy, enIndex) { 
  projectiles.forEach((projectile, prIndex ) => {
    const dist = Vector2.distance(projectile.position, enemy.position);

    if(dist - enemy.radius - projectile.radius < 1){
      setTimeout(() => { //previne um "flash" quando inimigo é destruído
        projectiles.splice(prIndex,1);
        enemies.splice(enIndex,1);
      }, 0)
    }
  });
}

function updateEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.update();
    const distToPlayer = Vector2.distance(player.position, enemy.position);
    
    if(distToPlayer - enemy.radius - player.radius < 0.7) {
      cancelAnimationFrame(animationID);
      isStopped = true;
    }

    checkDistanceToProjectiles(enemy, index);
  })
}

function updateProjectiles() {
  projectiles.forEach((projectile, index) => {
    projectile.update();

    if(projectile.position.x - projectile.radius < 0 ||
       projectile.position.x - projectile.radius > canvas.width ||
       projectile.position.y + projectile.radius < 0 ||
       projectile.position.y - projectile.radius > canvas.height) {
      setTimeout(() => {
        projectiles.splice(index,1);
      }, 0)
    }
  });
}


function animate() {
  animationID = requestAnimationFrame(animate);
  context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // context.clearRect(0,0, canvas.width, canvas.height);
  player.draw();
  
  updateProjectiles();
  updateEnemies();

}

function restartGame(){
  projectiles = [];

  enemies = [];

  animate();
}

function onMouseClick(event) {
  console.log(projectiles);
  const angle = getAngleToMidScreen(event.clientX, event.clientY);
  const velocity = new Vector2();
  velocity.x = Math.cos(angle) * 4;
  velocity.y = Math.sin(angle) * 4;

  const projectile = new Projectile(new Vector2(midX,midY),
    7, 'white', velocity);

  projectiles.push(projectile);
}

addEventListener('click', (event) => onMouseClick(event));

addEventListener('keypress', (event) => {
  console.log(event.key);
  if(event.key == 's') {
    cancelAnimationFrame(animationID);
    restartGame();
  }
})

if(!isStopped){
  animate();
  spawnEnemies();
} else {
  cancelAnimationFrame(animationID);
}