document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const bestScoreDisplay = document.getElementById('best-score-display'); // NEW
    const gameOverDisplay = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    const startBtn = document.getElementById('start-btn');

    // Game settings
    const gridSize = 20;
    const tileCount = 20;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;

    // Game variables
    let snake = [{ x: 10, y: 10 }];
    let food = {};
    let xVelocity = 0;
    let yVelocity = 0;
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0; // NEW
    let gameRunning = false;
    let gameSpeed = 150;
    let gameLoop;

    // Draw functions
    function drawGame() {
        // Clear the canvas without covering the background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFood();
        drawSnake();
    }

    function drawSnake() {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; // Slightly transparent lime
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    function drawFood() {
        ctx.font = `${gridSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍎', food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2);
    }


    // Game logic
    function moveSnake() {
        const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };

        // Collision with wall
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // Collision with self
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;

            // 🏆 Update best score
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore', bestScore);
                bestScoreDisplay.textContent = `Best: ${bestScore}`;
            }

            generateFood();

            if (score % 5 === 0 && gameSpeed > 50) {
                gameSpeed -= 10;
                clearInterval(gameLoop);
                gameLoop = setInterval(updateGame, gameSpeed);
            }
        } else {
            snake.pop();
        }
    }

    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        for (let i = 0; i < snake.length; i++) {
            if (food.x === snake[i].x && food.y === snake[i].y) {
                generateFood();
                return;
            }
        }
    }

    function gameOver() {
        console.log('Game Over! Snake:', snake, 'Food:', food, 'Velocity:', xVelocity, yVelocity);
        gameRunning = false;
        clearInterval(gameLoop);
        gameOverDisplay.style.display = 'flex';
        restartBtn.style.display = 'block';
    }

    function updateGame() {
        if (gameRunning) {
            moveSnake();
            drawGame();
        }
    }

    function startGame() {
        snake = [{ x: 10, y: 10 }];
        xVelocity = 1;
        yVelocity = 0;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
        gameSpeed = 150;
        gameRunning = true;
        gameOverDisplay.style.display = 'none';
        restartBtn.style.display = 'none';

        generateFood();

        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, gameSpeed);
    }


    // Event listeners
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'w':
                if (yVelocity === 1) return;
                xVelocity = 0;
                yVelocity = -1;
                break;
            case 's':
                if (yVelocity === -1) return;
                xVelocity = 0;
                yVelocity = 1;
                break;
            case 'a':
                if (xVelocity === 1) return;
                xVelocity = -1;
                yVelocity = 0;
                break;
            case 'd':
                if (xVelocity === -1) return;
                xVelocity = 1;
                yVelocity = 0;
                break;
            case 'ArrowUp':
                if (yVelocity === 1) return;
                xVelocity = 0;
                yVelocity = -1;
                break;
            case 'ArrowDown':
                if (yVelocity === -1) return;
                xVelocity = 0;
                yVelocity = 1;
                break;
            case 'ArrowLeft':
                if (xVelocity === 1) return;
                xVelocity = -1;
                yVelocity = 0;
                break;
            case 'ArrowRight':
                if (xVelocity === -1) return;
                xVelocity = 1;
                yVelocity = 0;
                break;

            case ' ':
            case 'Space':
            case 'Spacebar':
                if (!gameRunning && gameOverDisplay.style.display === 'flex') {
                    startGame();
                }
                break;
        }
    });

    startBtn.addEventListener('click', startGame); // Start game on button click
    restartBtn.addEventListener('click', startGame);

    const resetBestBtn = document.getElementById('reset-best-btn');

    resetBestBtn.addEventListener('click', () => {
        localStorage.removeItem('bestScore');
        bestScore = 0;
        bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    });
});