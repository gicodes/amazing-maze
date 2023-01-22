const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// My-Maze Parameters;
const cellsX = 10;
const cellsY = 12;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsX;
const unitLengthY = height / cellsY;

// Get, set and run the canvas
const engine = Engine.create();
engine.world.gravity.y = 1;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);

// Maze generation
const shuffle = arr => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

// Creating the grid, rows and columns with our cells: X and Y parameters
const grid = Array(cellsY)
  .fill(null)
  .map(() => Array(cellsX).fill(false));

const verticals = Array(cellsY)
  .fill(null)
  .map(() => Array(cellsX - 1).fill(false));

const horizontals = Array(cellsY - 1)
  .fill(null)
  .map(() => Array(cellsX).fill(false));

const startRow = Math.floor(Math.random() * cellsY);
const startColumn = Math.floor(Math.random() * cellsX);

const stepThroughCell = (row, column) => {

  // If i have visted the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as it's being visited
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);

  // For each neighbor...
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsY ||
      nextColumn < 0 ||
      nextColumn >= cellsX
    ) {
      continue;
    }

    // If we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // Remove a wall from either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall);
  });
});

// Ball
const ballRad = Math.min(unitLengthX, unitLengthY) / 4.5;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRad, {
  label: 'ball',
  render: {
    fillStyle: 'green'
  }
});
World.add(world, ball);

// Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 5,
  height - unitLengthY / 4,
  unitLengthX * 0.5,
  unitLengthY * 0.5,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'green'
    }
  }
);
World.add(world, goal);


document.addEventListener('keydown', event => {

  const { x, y } = ball.velocity;

  // key up
  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  // key right
  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 4, y });
  }
  // key down
  if (event.keyCode === 83 || event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  // key left
  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 4, y });
  }
  // set ball afloat
  if (event) {
    engine.world.gravity.y = 0;
  }
});

// set time event
timeCount = () => {
  if (count) {
    count++;
  }
}

count = setInterval(timeCount, 1000);

// Win Condition
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(collision => {
    const labels = ['ball', 'goal'];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }

        const win_text = document.querySelector('.win-text');
        win_text.classList.remove('is-hidden');
        console.log(`You took ${count} seconds`);
        // clearInterval(count);
      });
    }
  });
});