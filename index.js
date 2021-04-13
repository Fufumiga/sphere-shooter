var game = {};
game.restart = () => {};

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, 
      this.radius, 0, Math.PI*2, false);
    
    context.fillStyle = this.color;
    context.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, 
      this.radius, 0, Math.PI*2, false);
    
    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

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

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, 
      this.radius, 0, Math.PI*2, false);
    
    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const midX = canvas.width / 2;
const midY = canvas.height / 2;

const player = new Player(midX, midY, 20, 'blue');
player.draw();

var projectiles = [];
var enemies = [];

function spawnEnemies() {
  setInterval(() => {
    const x = 100;
    const y = 100;
    const radius = 20
    const color = 'green';
    const velocity = new Vector2(1,1)
    var enemy = new Enemy(x,y,radius,color,velocity)

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
  })
}

addEventListener('click', (event) => {
  const yDistance = event.clientY - midY;
  const xDistance = event.clientX - midX;

  const angle = Math.atan2(yDistance,xDistance);

  const velocity = new Vector2();
  velocity.x = Math.cos(angle);
  velocity.y = Math.sin(angle);

  const projectile = new Projectile(midX, midY,
    7, 'red', velocity);

  projectiles.push(projectile);
})

animate();
spawnEnemies();