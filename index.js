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

// textures
var cat;
var wood;

function preload() {
  sun.texture = loadImage('images/sun.jpg');
  train = loadModel('images/train.obj');
  cat = loadImage('images/cat.jpg');
  wood = loadImage('images/wood.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(FRAMERATE);
  setAttributes('perPixelLighting', true);

  horizontalMiddle = 0;
  verticalMiddle = 0;

  sun = {
    ...sun,
    x: horizontalMiddle,
    y: verticalMiddle,
    size: 120
  };

  const planets = [
    new Planet('HAT-P-32b', sun, 30, [1, 0.5, 0], 0.018, 15, color(107, 155, 237)),
    new Planet('HAT-P-67b', sun, 70, [1, -0.5, 0], 0.014, 18, color(135, 72, 182)),
    new Box('Boxy-Boi', sun, 110, [0.5, 1, 0], 0.01, 21, color(250, 159, 203)),
    new CustomPlanetaryObject(
      'PKP Łódź-Warszawa',
      sun,
      150,
      [-0.5, 1, 0],
      0.006,
      train,
      20,
      6,
      wood
    )
  ];

  const moons = [
    new Moon(planets[0], 10, [1, 0.5, 0], 0.03, 6, color(210, 231, 255)),
    new Moon(planets[1], 12, [1, 0.5, 0], 0.025, 8, color(247, 231, 255)),
    new Moon(planets[1], 25, [0.5, 1, 0], 0.02, 4, color(217, 251, 255)),
    new Moon(planets[2], 30, [0.5, 1, 0], 0.015, 10, color(217, 231, 205)),
    new Moon(planets[3], 10, [1, 0.5, 0], 0.02, 5, color(217, 201, 155)),
    new Moon(planets[3], 20, [0.5, 1, 0], 0.035, 7, color(217, 221, 255)),
    new Moon(planets[3], 30, [1, -0.5, 0], 0.03, 10, color(210, 231, 155))
  ];

  celestials = [...planets, ...moons];
}

function draw() {
  background(0, 0, 35);
  currentFrame = getCurrentFrameInSecond();

  noStroke();
  ambientLight(150);
  drawStarBackground();
  drawSun();
  drawCelestials();
}

function drawCelestials() {
  celestials.forEach(celestial => celestial.draw());
}
function drawSun() {
  push();

  // TODO: lighting
  // spotLight(245, 223, 98, horizontalMiddle, verticalMiddle, 1500, 0, 0, -1, 200, 0);
  rotateX(millis() / 3000);
  rotateZ(millis() / 3000);

  texture(sun.texture);
  sphere(sun.size / 2);

  pop();
}

//blinking stars
function drawStarBackground() {
  const newStar = new Star();
  stars.push(newStar);

  stars.filter(star => {
    star.draw();
    if (star.framesAlive === FRAMERATE) {
      delete star;
      return false;
    }
    return true;
  });
}

class Celestial {
  constructor(orbitee, orbitRadius, direction, speed) {
    this.orbitee = orbitee;
    this.orbitRadius = this.orbitee.size + orbitRadius;
    this.angle = 0;
    this.speed = speed;
    this.initialDirection = createVector(...direction);
    this.translationVector = p5.Vector.mult(this.initialDirection, this.orbitRadius);
  }

  updatePosition() {
    const perpendicularTo2DPLaneVector = createVector(0, 0, 1);

    this.rotationVector = this.translationVector.cross(perpendicularTo2DPLaneVector);

    rotate(this.angle, this.rotationVector);
    translate(this.translationVector);
  }

  draw() {
    this.updatePosition();

    this.angle += this.speed;
  }
}

class CustomPlanetaryObject extends Celestial {
  constructor(name, orbitee, orbitRadius, initialAngle, speed, model, size, scale, texture) {
    super(orbitee, orbitRadius, initialAngle, speed);

    this.name = name;
    this.model = model;
    this.size = size;
    this.scale = scale;
    this.texture = texture;
  }

  draw() {
    push();

    // TODO: render name

    super.draw();

    rotateZ(TWO_PI);
    texture(this.texture);
    scale(this.scale);
    model(this.model);

    pop();
  }
}

class Planet extends Celestial {
  constructor(name, orbitee, orbitRadius, direction, speed, size, color) {
    super(orbitee, orbitRadius, direction, speed);
    this.color = color;
    this.name = name;
    this.size = size;
  }
  draw() {
    push();

    super.draw();
    ambientMaterial(this.color);
    sphere(this.size);

    pop();
  }
}

class Box extends Celestial {
  constructor(name, orbitee, orbitRadius, direction, speed, size, color) {
    super(orbitee, orbitRadius, direction, speed);
    this.color = color;
    this.name = name;
    this.size = size;
  }
  draw() {
    push();

    super.draw();
    specularMaterial(this.color);
    box(this.size, this.size);

    pop();
  }
}

class Moon extends Celestial {
  constructor(orbitee, orbitRadius, direction, speed, size, color) {
    super(orbitee, orbitRadius, direction, speed);

    this.color = color;
    this.size = size;
  }

  draw() {
    push();

    rotate(this.orbitee.angle, this.orbitee.rotationVector);
    translate(this.orbitee.translationVector);
    super.draw();
    ambientMaterial(this.color);
    sphere(this.size);

    pop();
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
