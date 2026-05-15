// ==================== THEME SYSTEM ====================
const THEMES = {
    nature: {
        name: 'Nature',
        paddleColor: '#52b788',
        ballColor: '#ff6b6b',
        lineColor: 'rgba(82, 183, 136, 0.3)',
        backgroundColor: 'linear-gradient(135deg, #1b3c2f 0%, #2d5016 50%, #52b788 100%)'
    },
    futuristic: {
        name: 'Futuristic',
        paddleColor: '#00d4ff',
        ballColor: '#ff0080',
        lineColor: 'rgba(0, 212, 255, 0.3)',
        backgroundColor: 'linear-gradient(135deg, #0a0e27 0%, #16213e 50%, #0f3460 100%)'
    },
    neon: {
        name: 'Neon',
        paddleColor: '#00ff00',
        ballColor: '#ff006e',
        lineColor: 'rgba(0, 255, 0, 0.3)',
        backgroundColor: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
    },
    city: {
        name: 'City',
        paddleColor: '#ffb300',
        ballColor: '#00d4ff',
        lineColor: 'rgba(255, 179, 0, 0.3)',
        backgroundColor: 'linear-gradient(135deg, #1a1f36 0%, #2c3e50 50%, #546e7a 100%)'
    },
    medieval: {
        name: 'Medieval',
        paddleColor: '#daa520',
        ballColor: '#ff4444',
        lineColor: 'rgba(218, 165, 32, 0.3)',
        backgroundColor: 'linear-gradient(135deg, #2d1810 0%, #5c3d2e 50%, #8b4513 100%)'
    }
};

let currentTheme = 'nature';

// Initialize theme from localStorage or use default
function initializeTheme() {
    const savedTheme = localStorage.getItem('pongTheme');
    if (savedTheme && THEMES[savedTheme]) {
        currentTheme = savedTheme;
    }
}

// Apply theme to UI and game
function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('pongTheme', theme);
    
    document.body.className = `theme-${theme}`;
    document.getElementById('currentTheme').textContent = THEMES[theme].name;
}

// Theme selection event listeners
function setupThemeSelection() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const startBtn = document.getElementById('startGameBtn');
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            applyTheme(btn.dataset.theme);
            startBtn.disabled = false;
            startBtn.textContent = `Start Game - ${THEMES[currentTheme].name}`;
        });
    });
    
    startBtn.addEventListener('click', () => {
        startGame();
    });
}

// Show theme selector
function showThemeSelector() {
    const themeSelector = document.getElementById('themeSelector');
    const gameContainer = document.getElementById('gameContainer');
    themeSelector.classList.remove('hidden');
    gameContainer.classList.remove('game-visible');
    gameContainer.classList.add('game-hidden');
}

// Hide theme selector and show game
function hideThemeSelector() {
    const themeSelector = document.getElementById('themeSelector');
    const gameContainer = document.getElementById('gameContainer');
    themeSelector.classList.add('hidden');
    gameContainer.classList.remove('game-hidden');
    gameContainer.classList.add('game-visible');
}

// Change theme button
document.addEventListener('DOMContentLoaded', () => {
    const changeThemeBtn = document.getElementById('changeThemeBtn');
    if (changeThemeBtn) {
        changeThemeBtn.addEventListener('click', () => {
            showThemeSelector();
        });
    }
});

// ==================== GAME LOGIC ====================
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
let gamePaused = false;
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
    ctx.fillStyle = THEMES[currentTheme].paddleColor;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = THEMES[currentTheme].paddleColor;
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = THEMES[currentTheme].ballColor;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = THEMES[currentTheme].ballColor;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = THEMES[currentTheme].lineColor;
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
    
    // Draw pause indicator
    if (gamePaused) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Main game loop
function gameLoop() {
    if (!gameOver && !gamePaused) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// ==================== GAME CONTROLS ====================

// Pause functionality
function togglePause() {
    if (!gameOver) {
        gamePaused = !gamePaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    }
}

// Stop functionality
function stopGame() {
    resetGame();
    showThemeSelector();
}

// Reset game state
function resetGame() {
    player.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    computer.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    player.score = 0;
    computer.score = 0;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = INITIAL_BALL_SPEED;
    gameOver = false;
    gamePaused = false;
    
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('gameOverScreen').classList.remove('game-over-visible');
    document.getElementById('gameOverScreen').classList.add('game-over-hidden');
    updateScoreDisplay();
}

// Start game
function startGame() {
    hideThemeSelector();
    resetGame();
}

// Setup control buttons
document.addEventListener('DOMContentLoaded', () => {
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopGame);
    }
    
    setupThemeSelection();
});

// ==================== INITIALIZATION ====================

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    applyTheme(currentTheme);
    
    // Pre-select the current theme in the selector
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        if (btn.dataset.theme === currentTheme) {
            btn.classList.add('selected');
        }
    });
    
    // Show theme selector initially
    showThemeSelector();
});

updateScoreDisplay();
gameLoop();
