const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

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

const midX = canvas.width / 2;
const midY = canvas.height / 2;

const player = new Player(midX, midY, 10, 'blue');
player.draw();