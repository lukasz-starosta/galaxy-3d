// screen
var FRAMERATE = 30;
var getCurrentFrameInSecond = () => frameCount % FRAMERATE;
var currentFrame = 0;
var screenDiagonal;
var horizontalMiddle;
var verticalMiddle;

// objects
var stars = [];
var sun = {};
var celestials = [];

// models
var train;

function preload() {
  sun.texture = loadImage('images/sun.jpg');
  // train = loadModel('images/train.obj');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(FRAMERATE);
  setAttributes('perPixelLighting', true);

  horizontalMiddle = 0;
  verticalMiddle = 0;
  screenDiagonal = Math.sqrt(windowHeight ** 2 + windowWidth ** 2);

  sun = {
    ...sun,
    x: horizontalMiddle,
    y: verticalMiddle,
    radius: 40
  };

  const planets = [
    new Planet('HAT-P-32b', sun, -10, 0, 0.018, 30, color(107, 155, 237)),
    new Planet('HAT-P-67b', sun, 60, 90, 0.014, 40, color(135, 72, 182)),
    new Planet('Kepler-13 Ab', sun, 140, 170, 0.01, 50, color(250, 159, 203)),
    new Planet('GQ Lupi B', sun, 210, 10, 0.006, 60, color(48, 34, 96))
  ];

  const moons = [
    new Moon(planets[0], 0, 10, 0.03, 8, color(217, 231, 255)),
    new Moon(planets[1], 5, 10, 0.025, 10, color(217, 231, 255)),
    new Moon(planets[1], 8, 15, 0.02, 12, color(217, 231, 255)),
    new Moon(planets[2], 30, 10, 0.015, 20, color(217, 231, 255)),
    new Moon(planets[3], -10, 5, 0.02, 10, color(217, 231, 255)),
    new Moon(planets[3], 5, 20, 0.035, 15, color(217, 231, 255)),
    new Moon(planets[3], 35, 40, 0.03, 20, color(217, 231, 255))
  ];

  celestials = [...planets, ...moons];
}

function draw() {
  background(0, 0, 35);
  currentFrame = getCurrentFrameInSecond();

  noStroke();
  ambientLight(255);
  drawStarBackground();
  drawSun();
  // drawCelestials();
}

function drawCelestials() {
  celestials.forEach(celestial => celestial.draw());
}
function drawSun() {
  // pointLight(245, 223, 98, 0, 0, 1500);
  // ambientMaterial(245, 223, 98);
  rotateX(millis() / 3000);
  rotateZ(millis() / 3000);

  texture(sun.texture);
  sphere(sun.radius);
  // craters
  // ambientMaterial(245, 201, 98);
  // ellipse(sun.x - 20, sun.y - 20, 15);
  // ellipse(sun.x + 15, sun.y - 5, 10);
  // ellipse(sun.x - 5, sun.y + 15, 5);
}

//blinking stars
function drawStarBackground() {
  stars.push(new Star());
  stars.filter(star => {
    star.draw();
    return star.framesAlive === FRAMERATE;
  });
}

class Celestial {
  constructor(orbitee, orbitRadius, initialAngle, speed, size, fillColor) {
    this.orbitee = orbitee;
    this.orbitRadius = this.orbitee.size + orbitRadius;
    this.angle = initialAngle;
    this.speed = speed;
    this.size = size;
    this.fillColor = fillColor;

    this.updatePosition();
  }

  distanceFromSun() {
    return Math.sqrt((this.x - sun.x) ** 2 + (this.y - sun.y) ** 2);
  }

  getDarkness() {
    return this.distanceFromSun() / (screenDiagonal / 3) - 0.25;
  }

  updatePosition() {
    this.x = this.orbitee.x + this.orbitRadius * cos(this.angle);
    this.y = this.orbitee.y + this.orbitRadius * sin(this.angle);
  }

  draw(color = this.fillColor) {
    this.updatePosition();
    fill(color);
    ellipse(this.x, this.y, this.size);
    this.angle += this.speed;
  }
}

class Planet extends Celestial {
  constructor(name, orbitee, orbitRadius, initialAngle, speed, size, fillColor) {
    super(orbitee, orbitRadius, initialAngle, speed, size, fillColor);

    this.name = name;
  }

  draw() {
    super.draw();
    textSize(this.size / 3);
    fill(230);
    text(this.name, this.x - this.size, this.y - this.size / 2);
  }
}

class Moon extends Celestial {
  constructor(orbitee, orbitRadius, initialAngle, speed, size, fillColor) {
    super(orbitee, orbitRadius, initialAngle, speed, size, fillColor);

    this.randomPositionX = random(-this.size / 3, this.size / 3);
    this.randomPositionY = random(-this.size / 3, this.size / 3);
  }

  draw() {
    const col = lerpColor(this.fillColor, color(0), this.getDarkness());
    super.draw(col);
    // craters
    const craterCol = lerpColor(color(169, 183, 207), color(0), this.getDarkness());
    fill(craterCol);
    ellipse(this.x + this.randomPositionX, this.y + this.randomPositionY, this.size / 4);
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.t = random(TAU);
    this.framesAlive = 0;
  }

  draw() {
    this.framesAlive++;
    const scale = this.size + sin(this.t) * 2;
    noStroke();
    const starFill = color(240);
    starFill.setAlpha(150 - Math.abs(FRAMERATE / 2 - this.framesAlive) * 6);
    fill(starFill);
    ellipse(this.x - width / 2, this.y - height / 2, scale, scale);
  }
}
