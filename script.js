// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 5;
const MAX_BALL_SPEED = 10;
const WINNING_SCORE = 11;

// Game objects
const player = {
    x: 20,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - 20 - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: INITIAL_BALL_SPEED,
    dy: INITIAL_BALL_SPEED,
    speed: INITIAL_BALL_SPEED
};

let gameOver = false;
let mouseY = canvas.height / 2;

// Input handling
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update player paddle position
function updatePlayerPaddle() {
    if (keys['ArrowUp'] || keys['w']) {
        player.y = Math.max(0, player.y - PADDLE_SPEED);
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y = Math.min(canvas.height - player.height, player.y + PADDLE_SPEED);
    }
    
    // Mouse control with smoothing
    const targetY = mouseY - player.height / 2;
    const diff = targetY - player.y;
    if (Math.abs(diff) > 2) {
        player.y += diff * 0.1;
    } else {
        player.y = targetY;
    }
    
    // Keep player paddle in bounds
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// AI for computer paddle
function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const difference = ballCenter - computerCenter;
    
    // AI difficulty: slower reaction than player
    const aiSpeed = PADDLE_SPEED * 0.65;
    
    if (Math.abs(difference) > 10) {
        if (difference > 0) {
            computer.y = Math.min(canvas.height - computer.height, computer.y + aiSpeed);
        } else {
            computer.y = Math.max(0, computer.y - aiSpeed);
        }
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.size <= 0) {
        ball.y = ball.size;
        ball.dy = -ball.dy;
    } else if (ball.y + ball.size >= canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy = -ball.dy;
    }
    
    // Paddle collision - Player
    if (ball.x - ball.size <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height) {
        ball.x = player.x + player.width + ball.size;
        ball.dx = -ball.dx;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * ball.speed * 0.5;
        
        // Increase ball speed slightly
        ball.speed = Math.min(MAX_BALL_SPEED, ball.speed + 0.5);
        ball.dx = Math.abs(ball.dx) < ball.speed ? ball.speed : ball.dx;
    }
    
    // Paddle collision - Computer
    if (ball.x + ball.size >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height) {
        ball.x = computer.x - ball.size;
        ball.dx = -ball.dx;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * ball.speed * 0.5;
        
        // Increase ball speed slightly
        ball.speed = Math.min(MAX_BALL_SPEED, ball.speed + 0.5);
        ball.dx = Math.abs(ball.dx) < ball.speed ? -ball.speed : ball.dx;
    }
    
    // Scoring
    if (ball.x - ball.size < 0) {
        computer.score++;
        resetBall();
        updateScoreDisplay();
        checkGameOver();
    } else if (ball.x + ball.size > canvas.width) {
        player.score++;
        resetBall();
        updateScoreDisplay();
        checkGameOver();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = INITIAL_BALL_SPEED;
    
    // Random direction
    const angle = (Math.random() - 0.5) * Math.PI / 4;
    const speed = INITIAL_BALL_SPEED;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * speed * Math.cos(angle);
    ball.dy = speed * Math.sin(angle);
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Check if game is over
function checkGameOver() {
    if (player.score >= WINNING_SCORE || computer.score >= WINNING_SCORE) {
        gameOver = true;
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameOverText = document.getElementById('gameOverText');
        const winnerText = document.getElementById('winnerText');
        
        if (player.score >= WINNING_SCORE) {
            gameOverText.textContent = 'You Win!';
            winnerText.textContent = `Final Score: ${player.score} - ${computer.score}`;
        } else {
            gameOverText.textContent = 'Game Over!';
            winnerText.textContent = `Computer wins! Final Score: ${player.score} - ${computer.score}`;
        }
        
        gameOverScreen.classList.remove('game-over-hidden');
        gameOverScreen.classList.add('game-over-visible');
    }
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 0, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles and ball
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Main game loop
function gameLoop() {
    if (!gameOver) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
updateScoreDisplay();
gameLoop();
