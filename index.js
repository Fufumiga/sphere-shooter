var game = {};
game.restart = () => {};

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

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

const player = new Player(midX, midY, 20, 'blue');

var projectiles = [];
var enemies = [];

function getAngleToMidScreen(x,y) {
  const yDistance = y - midY;
  const xDistance = x - midX;

  return Math.atan2(yDistance,xDistance);
}

function getRandomBetween(min,max) {
  return Math.random() * (max - min) + min;
}

function checkDistanceToProjectiles(enemy) {
  projectiles.forEach(projectile => {
    const dist = Vector2.distance(projectile.position, enemy.position);
    console.log(dist);
  });
}
function spawnEnemies() {

  setInterval(() => {
    const radius = getRandomBetween(9,20);
    const color = 'green';

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

function animate() {
  requestAnimationFrame(animate);

  context.clearRect(0,0, canvas.width, canvas.height);
  player.draw();

  projectiles.forEach( projectile => {
    projectile.update();
  });

  enemies.forEach(enemy => {
    enemy.update();
    checkDistanceToProjectiles(enemy);
  })
}

addEventListener('click', (event) => {
  const angle = getAngleToMidScreen(event.clientX, event.clientY);

  const velocity = new Vector2();
  velocity.x = Math.cos(angle);
  velocity.y = Math.sin(angle);

  const projectile = new Projectile(new Vector2(midX,midY),
    7, 'red', velocity);

  projectiles.push(projectile);
})

animate();
spawnEnemies();