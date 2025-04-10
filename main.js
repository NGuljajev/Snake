document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const bestScoreDisplay = document.getElementById('best-score-display');
    const gameOverDisplay = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    const startBtn = document.getElementById('start-btn');
    const resetBestBtn = document.getElementById('reset-best-btn');

    // Game settings
    const gridSize = 20;
    const tileCount = 20;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;

    // Food types
    const foodTypes = [
        { name: 'apple', emoji: '🍎', points: 1 },
        { name: 'lollipop', emoji: '🍭', points: 1 },
        { name: 'pizza', emoji: '🍕', points: 1 }
    ];

    // Game variables
    let snake = [{ x: 10, y: 10 }];
    let food = {};
    let xVelocity = 0;
    let yVelocity = 0;
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameRunning = false;
    let gameSpeed = 150;
    let gameLoop;

    // Draw functions
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFood();
        drawSnake();
    }

    function drawSnake() {
        ctx.fillStyle = '#00FF00';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    function drawFood() {
        ctx.font = `${gridSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.emoji, food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2);
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
            score += food.points;
            scoreDisplay.textContent = `Score: ${score}`;

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
        const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        const newFood = {
            ...type,
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                generateFood();
                return;
            }
        }

        food = newFood;
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);

        gameOverDisplay.style.display = 'flex';
        restartBtn.style.display = 'block';

        const finalScoreDisplay = document.getElementById('final-score');
        finalScoreDisplay.textContent = `Your Score: ${score}`;

        const bestScoreDisplayEnd = document.getElementById('best-score-end');
        bestScoreDisplayEnd.textContent = `Best Score: ${bestScore}`;
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

    // Controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                if (yVelocity === 1) return;
                xVelocity = 0;
                yVelocity = -1;
                break;
            case 's':
            case 'ArrowDown':
                if (yVelocity === -1) return;
                xVelocity = 0;
                yVelocity = 1;
                break;
            case 'a':
            case 'ArrowLeft':
                if (xVelocity === 1) return;
                xVelocity = -1;
                yVelocity = 0;
                break;
            case 'd':
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

    // Button events
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    resetBestBtn.addEventListener('click', () => {
        localStorage.removeItem('bestScore');
        bestScore = 0;
        bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    });
});
