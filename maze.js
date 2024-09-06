const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
let maze = [];
let cellSize = 70;
let difficulty = 'easy';
let solutionPath = [];
let player = { x: 0, y: 0 };
let end = {};

function setDifficulty(level) {
    difficulty = level;
    generateMaze();
}

function generateMaze() {
    let size;
    if (difficulty === 'easy') size = 10;
    else if (difficulty === 'medium') size = 20;
    else size = 30;

    cellSize = 700 / size;
    maze = createMaze(size, size);
    solutionPath = [];
    player = { x: 0, y: 0 };
    drawMaze();
}

function createMaze(cols, rows) {
    const grid = [];
    const stack = [];
    const directions = [
        [0, -1], [1, 0], [0, 1], [-1, 0]
    ];

    class Cell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.walls = [true, true, true, true]; // top, right, bottom, left
            this.visited = false;
        }
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            grid.push(new Cell(x, y));
        }
    }

    function getIndex(x, y) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
        return y * cols + x;
    }

    const current = grid[0];
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
        const current = stack.pop();
        const neighbors = [];

        directions.forEach(([dx, dy], index) => {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const neighborIndex = getIndex(nx, ny);
            const neighbor = grid[neighborIndex];
            if (neighbor && !neighbor.visited) {
                neighbors.push([neighbor, index]);
            }
        });

        if (neighbors.length > 0) {
            stack.push(current);
            const [next, index] = neighbors[Math.floor(Math.random() * neighbors.length)];
            next.visited = true;
            stack.push(next);
            current.walls[index] = false;
            next.walls[(index + 2) % 4] = false;
        }
    }

    return grid;
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    maze.forEach(cell => {
        const x = cell.x * cellSize;
        const y = cell.y * cellSize;
        ctx.beginPath();
        if (cell.walls[0]) ctx.moveTo(x, y), ctx.lineTo(x + cellSize, y); // Top
        if (cell.walls[1]) ctx.moveTo(x + cellSize, y), ctx.lineTo(x + cellSize, y + cellSize); // Right
        if (cell.walls[2]) ctx.moveTo(x + cellSize, y + cellSize), ctx.lineTo(x, y + cellSize); // Bottom
        if (cell.walls[3]) ctx.moveTo(x, y + cellSize), ctx.lineTo(x, y); // Left
        ctx.stroke();
    });

    // Draw start and end points
    const start = maze[0];
    end = maze[maze.length - 1];
    
    // Draw start point
    ctx.fillStyle = 'blue';
    ctx.fillRect(start.x * cellSize, start.y * cellSize, cellSize, cellSize);
    
    // Draw end point
    ctx.fillStyle = 'red';
    ctx.fillRect(end.x * cellSize, end.y * cellSize, cellSize, cellSize);

    // Draw solution path
    if (solutionPath.length) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        solutionPath.forEach(([x, y]) => {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        });
    }

    // Draw player
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);
}

function bfs(start, end) {
    console.log('Starting BFS');
    const queue = [start];
    const cameFrom = { [`${start.x},${start.y}`]: null };
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
        const current = queue.shift();
        console.log('Visiting cell:', current.x, current.y);
        
        if (current.x === end.x && current.y === end.y) {
            const path = [];
            let temp = current;
            while (temp) {
                path.push([temp.x, temp.y]);
                temp = cameFrom[`${temp.x},${temp.y}`];
            }
            return path.reverse();
        }

        // Check neighbors
        const neighbors = [
            [current.x, current.y - 1], // Top
            [current.x + 1, current.y], // Right
            [current.x, current.y + 1], // Bottom
            [current.x - 1, current.y]  // Left
        ];

        neighbors.forEach(([nx, ny], i) => {
            if (nx >= 0 && ny >= 0 && nx < canvas.width / cellSize && ny < canvas.height / cellSize) {
                const neighborIndex = getIndex(nx, ny);
                const neighbor = maze[neighborIndex];
                const wallCheck = (i === 0 && neighbor.walls[2]) || // Top
                                  (i === 1 && neighbor.walls[3]) || // Right
                                  (i === 2 && neighbor.walls[0]) || // Bottom
                                  (i === 3 && neighbor.walls[1]);   // Left

                if (!visited.has(`${nx},${ny}`) && !wallCheck) {
                    visited.add(`${nx},${ny}`);
                    queue.push(maze[neighborIndex]);
                    cameFrom[`${nx},${ny}`] = current;
                }
            }
        });
    }
    console.log('No path found');
    return [];
}

function getIndex(x, y) {
    if (x < 0 || y < 0 || x >= canvas.width / cellSize || y >= canvas.height / cellSize) return -1;
    return y * (canvas.width / cellSize) + x;
}

function showSolution() {
    const start = maze[0];
    const end = maze[maze.length - 1];
    solutionPath = bfs(start, end);
    drawMaze();
}

function checkWin() {
    if (player.x === end.x && player.y === end.y) {
        alert("Congratulations! You've solved the maze!");
    }
}

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const oldX = player.x;
    const oldY = player.y;

    if (key === 'ArrowUp' && !maze[getIndex(player.x, player.y)].walls[0]) {
        player.y -= 1;
    } else if (key === 'ArrowRight' && !maze[getIndex(player.x, player.y)].walls[1]) {
        player.x += 1;
    } else if (key === 'ArrowDown' && !maze[getIndex(player.x, player.y)].walls[2]) {
        player.y += 1;
    } else if (key === 'ArrowLeft' && !maze[getIndex(player.x, player.y)].walls[3]) {
        player.x -= 1;
    }

    if (oldX !== player.x || oldY !== player.y) {
        drawMaze();
        checkWin();
    }
});

generateMaze();
