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
var cybertruck;

// textures
var metal;

// spaceship
var spaceship;

// mouse related variables
var mouseYOnClick, mouseYPositionDifference;
var mouseXOnClick, mouseXPositionDifference;

function mousePressed() {
  mouseXOnClick = mouseX;
  mouseYOnClick = mouseY;
}

function preload() {
  sun.texture = loadImage('images/sun.jpg');
  cybertruck = loadModel('images/cybertruck.obj');
  metal = loadImage('images/metal.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(FRAMERATE);
  setAttributes('perPixelLighting', true);

  mouseXOnClick = mouseX;
  mouseYOnClick = mouseY;

  horizontalMiddle = 0;
  verticalMiddle = 0;

  sun = {
    ...sun,
    x: horizontalMiddle,
    y: verticalMiddle,
    size: 120
  };

  spaceship = new Spaceship();

  const planets = [
    new Planet('HAT-P-32b', sun, 30, [1, 0.5, 0], 0.018, 15, color(77, 36, 143)),
    new Planet('HAT-P-67b', sun, 70, [1, -0.5, 0], 0.014, 18, color(70, 162, 227)),
    new Box('Boxy-Boi', sun, 110, [0.5, 1, 0], 0.01, 50, color(140, 105, 10)),
    new CustomPlanetaryObject(
      'PKP Łódź-Warszawa',
      sun,
      150,
      [-0.5, 1, 0],
      0.006,
      cybertruck,
      20,
      0.1,
      metal
    )
  ];

  const moons = [
    new Moon(planets[0], 10, [1, 0.5, 0], 0.03, 6, color(89, 89, 89)),
    new Moon(planets[1], 12, [1, 0.5, 0], 0.025, 8, color(130, 130, 130)),
    new Moon(planets[1], 25, [0.5, 1, 0], 0.02, 4, color(163, 163, 163)),
    new Moon(planets[2], 30, [0.5, 1, 0], 0.015, 10, color(110, 110, 110)),
    new Moon(planets[3], 10, [1, 0.5, 0], 0.02, 5, color(156, 146, 128)),
    new Moon(planets[3], 20, [0.5, 1, 0], 0.035, 7, color(97, 88, 69)),
    new Moon(planets[3], 30, [1, -0.5, 0], 0.03, 10, color(140, 134, 121))
  ];

  celestials = [...planets, ...moons];
}

function draw() {
  background(0, 0, 35);
  currentFrame = getCurrentFrameInSecond();

  noStroke();

  drawLights();
  drawStarBackground();
  drawSun();
  drawCelestials();

  if (keyIsDown(LEFT_ARROW)) {
    spaceship.left();
  }
  if (keyIsDown(RIGHT_ARROW)) {
    spaceship.right();
  }
  if (keyIsDown(UP_ARROW)) {
    spaceship.forward();
  }
  if (keyIsDown(DOWN_ARROW)) {
    spaceship.back();
  }

  // Draw spaceship
  spaceship.display();
}

function drawLights() {
  ambientLight(100);

  directionalLight(150, 150, 150, 1, 1, -1);
}

//blinking stars
function drawStarBackground() {
  if (stars.length < 100) {
    const newStar = new Star();
    stars.push(newStar);
  }
  stars.forEach(star => star.draw());
}

function drawSun() {
  pointLight(255, 214, 99, horizontalMiddle, verticalMiddle, 150);

  push();

  rotateX(millis() / 3000);
  rotateZ(millis() / 3000);

  texture(sun.texture);
  sphere(sun.size / 2);

  pop();
}

function drawCelestials() {
  celestials.forEach(celestial => celestial.draw());
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

    super.draw();

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
    this.x = random(-width, width);
    this.y = random(-height, height);
    this.z = random(-1000, 1000);
    this.size = random(1, 3);
    this.t = random(TAU);
    this.framesAlive = random(0, 15);
  }

  draw() {
    push();
    const scale = this.size + sin(this.t) * 2;
    noStroke();
    const starFill = color(240);
    starFill.setAlpha(150 - Math.abs(FRAMERATE / 2 - this.framesAlive) * 6);
    fill(starFill);
    translate(createVector(this.x, this.y, this.z));
    sphere(scale);

    pop();

    if (this.framesAlive / 2 > FRAMERATE) this.framesAlive = random(0, 15);
    else this.framesAlive++;
  }
}

// Spaceship
class Spaceship {
  constructor() {
    this.velocity = 5;

    // start at the middle of the screen with offset of 200 from the center (towards user)
    this.initialZOffset = 200;
    this.position = createVector(horizontalMiddle, verticalMiddle, this.initialZOffset);

    this.cameraDistance = this.initialZOffset + 200;
    // set the camera's position to this.cameraDistace behind the spaceship position
    this.cameraPosition = createVector(0, 0, this.cameraDistance);

    // create a vector pointing from camera to the spaceship
    this.directionVector = this.cameraPosition.copy().sub(this.position);
  }

  forward() {
    // make a unit vector out of direction
    const normalizedDirectionVector = this.directionVector.copy().normalize();

    // ensure the ship is going forward initially
    normalizedDirectionVector.z =
      normalizedDirectionVector.z >= 0 ? -normalizedDirectionVector.z : normalizedDirectionVector.z;
    const replacementVector = normalizedDirectionVector.mult(this.velocity);

    this.position.add(replacementVector);
    this.cameraPosition.add(replacementVector);
  }

  back() {
    // make a unit vector out of direction
    const normalizedDirectionVector = this.directionVector.copy().normalize();

    // ensure the ship is going forward initially
    normalizedDirectionVector.z =
      normalizedDirectionVector.z >= 0 ? -normalizedDirectionVector.z : normalizedDirectionVector.z;
    const replacementVector = normalizedDirectionVector.mult(this.velocity);

    // subtract the replacement vector to move backwards
    this.position.sub(replacementVector);
    this.cameraPosition.sub(replacementVector);
  }

  right() {
    // make a unit vector out of direction
    const normalizedDirectionVector = this.directionVector.copy().normalize();

    // interpolate the unit vector with the right vector to ensure the ship is going right
    const interpolatedVector = normalizedDirectionVector.lerp(createVector(1, 0, 0), 0.5);
    const replacementVector = interpolatedVector.mult(this.velocity);

    this.position.add(replacementVector);
    this.cameraPosition.add(replacementVector);
  }

  left() {
    // make a unit vector out of direction
    const normalizedDirectionVector = this.directionVector.copy().normalize();

    // interpolate the unit vector with the right vector to ensure the ship is going right
    const interpolatedVector = normalizedDirectionVector.lerp(createVector(1, 0, 0), 0.5);
    const replacementVector = interpolatedVector.mult(this.velocity);

    this.position.sub(replacementVector);
    this.cameraPosition.sub(replacementVector);
  }

  // Draw the ship
  display() {
    if (mouseIsPressed) {
      mouseXPositionDifference = mouseX - mouseXOnClick;
      mouseYPositionDifference = mouseY - mouseYOnClick;

      const cameraTranslation = createVector(mouseXPositionDifference, mouseYPositionDifference, 0);

      if (this.cameraPosition.x > this.cameraDistance) {
        this.cameraPosition.x = this.cameraDistance;
      } else if (this.cameraPosition.x < -this.cameraDistance) {
        this.cameraPosition.x = -this.cameraDistance;
      }

      if (this.cameraPosition.y > this.cameraDistance) {
        this.cameraPosition.y = this.cameraDistance;
      } else if (this.cameraPosition.y < -this.cameraDistance) {
        this.cameraPosition.y = -this.cameraDistance;
      }

      // subtract - dont invert camera with respect to mouse, move camera back the translation vector
      this.cameraPosition.sub(cameraTranslation);

      // set the direction vector as the *difference* between camera position and position vectors
      this.directionVector.set(
        this.cameraPosition
          .copy()
          .sub(this.position)
          .mult(-1)
      );

      mouseXOnClick = mouseX;
      mouseYOnClick = mouseY;
    }

    const displaySpaceship = () => {
      // top cylinder
      push();
      ambientMaterial(201, 201, 201);
      translate(0, -30, 0);
      cylinder(6, 3);
      pop();

      // top cone
      push();
      ambientMaterial(4, 191, 88);
      translate(0, 5, 0);
      cone(40, 20);
      pop();

      // middle cylinder
      push();
      ambientMaterial(201, 201, 201);
      translate(0, -10, 0);
      cylinder(30, 10);
      pop();

      // bottom cone
      push();
      ambientMaterial(4, 191, 88);
      rotateX(radians(180));
      translate(0, 20, 0);
      cone(40, 20);
      pop();

      // bottom cylinder
      push();
      ambientMaterial(201, 201, 201);
      translate(0, 15, 0);
      cylinder(6, 3);
      pop();
    };

    camera(
      this.cameraPosition.x,
      this.cameraPosition.y,
      this.cameraPosition.z,
      this.position.x,
      this.position.y,
      this.position.z,
      0,
      1,
      0
    );

    push();

    translate(this.position);

    displaySpaceship();

    pop();
  }
}
