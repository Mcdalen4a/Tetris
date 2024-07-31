const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

const tetrominoes = [
    [[1, 1, 1, 1]], 
    [[1, 1, 1], [0, 1, 0]], 
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], 
    [[1, 1, 0], [0, 1, 1]], 
    [[1, 1, 1], [1, 0, 0]], 
    [[1, 1, 1], [0, 0, 1]]  
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentTetromino = createTetromino();
let currentPosition = { x: Math.floor(COLS / 2) - 1, y: 0 };
let gameInterval;

function drawBlock(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#000';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => row.forEach((value, x) => {
        if (value) drawBlock(x, y, COLORS[value - 1]);
    }));
}

function drawTetromino() {
    currentTetromino.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) drawBlock(currentPosition.x + dx, currentPosition.y + dy, COLORS[value - 1]);
    }));
}

function collisionTest(offsetX, offsetY) {
    return currentTetromino.shape.some((row, dy) => row.some((value, dx) => {
        if (value) {
            const x = currentPosition.x + dx + offsetX;
            const y = currentPosition.y + dy + offsetY;
            return x < 0 || x >= COLS || y >= ROWS || board[y][x];
        }
        return false;
    }));
}

function mergeTetromino() {
    currentTetromino.shape.forEach((row, dy) => row.forEach((value, dx) => {
        if (value) board[currentPosition.y + dy][currentPosition.x + dx] = value;
    }));
}

function removeFullRows() {
    board = board.reduce((rows, row) => {
        if (row.every(value => value)) {
            rows.unshift(Array(COLS).fill(0));
        } else {
            rows.push(row);
        }
        return rows;
    }, []);
}

function moveDown() {
    if (!collisionTest(0, 1)) {
        currentPosition.y++;
    } else {
        mergeTetromino();
        removeFullRows();
        currentTetromino = createTetromino();
        currentPosition = { x: Math.floor(COLS / 2) - 1, y: 0 };
        if (collisionTest(0, 0)) {
            clearInterval(gameInterval);
            alert('Game Over!');
        }
    }
}

function rotateTetromino() {
    const oldShape = currentTetromino.shape;
    currentTetromino.shape = currentTetromino.shape[0].map((_, i) =>
        currentTetromino.shape.map(row => row[i]).reverse()
    );
    if (collisionTest(0, 0)) {
        currentTetromino.shape = oldShape;
    }
}

function createTetromino() {
    const shape = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    const color = tetrominoes.indexOf(shape) + 1;
    return { shape: shape.map(row => row.map(() => color)) };
}

function updateGame() {
    drawBoard();
    drawTetromino();
    moveDown();
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && !collisionTest(-1, 0)) {
        currentPosition.x--;
    } else if (event.key === 'ArrowRight' && !collisionTest(1, 0)) {
        currentPosition.x++;
    } else if (event.key === 'ArrowDown') {
        moveDown();
    } else if (event.key === 'ArrowUp') {
        rotateTetromino();
    }
});

gameInterval = setInterval(updateGame, 500);
