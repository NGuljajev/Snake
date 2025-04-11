document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const bestScoreDisplay = document.getElementById('best-score-display');
    const gameOverDisplay = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    const startBtn = document.getElementById('start-btn');
    const resetBestBtn = document.getElementById('reset-best-btn');
    const moneyDisplay = document.getElementById('money-display');
    const shopBtn = document.getElementById('shop-btn');
    const shopMenu = document.getElementById('shop-menu');

    // Game settings
    const gridSize = 20;
    const tileCount = 20;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;

    // Game variables
    let gamePaused = false;
    let snake = [{ x: 10, y: 10 }];
    let food = {};
    let xVelocity = 0;
    let yVelocity = 0;
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameRunning = false;
    let gameSpeed = 150;
    let gameLoop;
    let money = 0;

    // Snake color options
    const shop = [
        { name: 'Default', color: '#00FF00', multiplier: 1, cost: 0 },
        { name: 'Red', color: '#FF0000', multiplier: 1.2, cost: 1 },
        { name: 'Blue', color: '#0000FF', multiplier: 1.5, cost: 100 },
        { name: 'Gold', color: '#FFD700', multiplier: 2, cost: 150 },
    ];

    let snakeColor = shop[0];

    // Draw functions
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFood();
        drawSnake();
    }

    function drawSnake() {
        if (snake.length === 0) return;

        // Use the selected snake color for the entire snake
        ctx.fillStyle = snakeColor.color;

        // Draw each segment of the snake
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
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

            // Fix multiplier calculation
            money += Math.round(food.points * snakeColor.multiplier);

            scoreDisplay.textContent = `Score: ${score}`;
            moneyDisplay.textContent = `💰 Money: ${money}`;

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
        const foodTypes = [
            { name: 'redapple', emoji: '🍎', points: 1 },
            { name: 'watermelon', emoji: '🍉', points: 1 },
            { name: 'kiwi', emoji: '🥝', points: 1 },
            { name: 'grapes', emoji: '🍇', points: 1 },
            { name: 'melon', emoji: '🍈', points: 1 },
            { name: 'lemon', emoji: '🍋', points: 1 },
            { name: 'orange', emoji: '🍊', points: 1 },
            { name: 'lime', emoji: '🍋‍🟩', points: 1 },
            { name: 'banana', emoji: '🍌', points: 1 },
            { name: 'pineapple', emoji: '🍍', points: 1 },
            { name: 'mango', emoji: '🥭', points: 1 },
            { name: 'greenapple', emoji: '🍏', points: 1 },
            { name: 'pear', emoji: '🍐', points: 1 },
            { name: 'peach', emoji: '🍑', points: 1 },
            { name: 'cherries', emoji: '🍒', points: 1 },
            { name: 'strawberry', emoji: '🍓', points: 1 },
            { name: 'blueberries', emoji: '🫐', points: 1 },
            { name: 'tomato', emoji: '🍅', points: 1 },
            { name: 'olive', emoji: '🫒', points: 1 },
            { name: 'coconut', emoji: '🥥', points: 1 },

            // vegetables
            { name: 'avocado', emoji: '🥑', points: 1 },
            { name: 'eggplant', emoji: '🍆', points: 1 },
            { name: 'potato', emoji: '🥔', points: 1 },
            { name: 'carrot', emoji: '🥕', points: 1 },
            { name: 'corn', emoji: '🌽', points: 1 },
            { name: 'hotpepper', emoji: '🌶️', points: 1 },
            { name: 'bellpepper', emoji: '🫑', points: 1 },
            { name: 'cucumber', emoji: '🥒', points: 1 },
            { name: 'leafygreen', emoji: '🥬', points: 1 },
            { name: 'broccoli', emoji: '🥦', points: 1 },
            { name: 'garlic', emoji: '🧄', points: 1 },
            { name: 'peanuts', emoji: '🥜', points: 1 },
            { name: 'beans', emoji: '🫘', points: 1 },
            { name: 'chestnut', emoji: '🌰', points: 1 },
            { name: 'gingerroot', emoji: '🫚', points: 1 },
            { name: 'peapod', emoji: '🫛', points: 1 },
            { name: 'brownmushroom', emoji: '🍄‍🟫', points: 1 },

            // prepared foods
            { name: 'pizza', emoji: '🍕', points: 1 },

            //sweets
            { name: 'chocolate', emoji: '🍫', points: 1 },
            { name: 'candy', emoji: '🍬', points: 1 },
            { name: 'cake', emoji: '🍰', points: 1 },
            { name: 'softicecream', emoji: '🍦', points: 1 },
            { name: 'cookie', emoji: '🍪', points: 1 },
            { name: 'pudding', emoji: '🍮', points: 1 },
            { name: 'doughnut', emoji: '🍩', points: 1 },
            { name: 'lollipop', emoji: '🍭', points: 1 },
            { name: 'shavedice', emoji: '🍧', points: 1 },
            { name: 'icecream', emoji: '🍨', points: 1 },
            { name: 'birthdaycake', emoji: '🎂', points: 1 },
            { name: 'cupcake', emoji: '🧁', points: 1 },
            { name: 'pie', emoji: '🥧', points: 1 },
            { name: 'honeypot', emoji: '🍯', points: 1 },
        ];
        const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        const newFood = {
            ...type,
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
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

        document.getElementById('final-score').textContent = `Your Score: ${score}`;
        document.getElementById('best-score-end').textContent = `Best Score: ${bestScore}`;
    }

    function updateGame() {
        if (gameRunning && !gamePaused) {
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
        startBtn.style.display = 'none';

        generateFood();

        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, gameSpeed);
    }

    function togglePause() {
        gamePaused = !gamePaused;

        if (gamePaused) {
            clearInterval(gameLoop);
            drawPauseScreen();
        } else {
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    }

    function drawPauseScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE to continue', canvas.width / 2, canvas.height / 2 + 40);
    }

    function populateShopMenu() {
        shopMenu.innerHTML = '<h3>Snake Colors</h3>';

        shop.forEach((item) => {
            const button = document.createElement('button');
            button.textContent = `${item.name} - ${item.cost} 💰 (x${item.multiplier})`;
            button.style.backgroundColor = item.color;
            button.disabled = money < item.cost || snakeColor.name === item.name;

            button.addEventListener('click', () => {
                if (money >= item.cost) {
                    money -= item.cost;
                    snakeColor = item;
                    moneyDisplay.textContent = `💰 Money: ${money}`;
                    populateShopMenu();
                }
            });

            shopMenu.appendChild(button);
        });
    }

    function toggleShopMenu() {
        if (shopMenu.style.display === 'none' || shopMenu.style.display === '') {
            populateShopMenu();
            shopMenu.style.display = 'block';
        } else {
            shopMenu.style.display = 'none';
        }
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Space') {
            if (!gameRunning) {
                startGame();
            } else {
                togglePause();
            }
        }

        if (!gameRunning || gamePaused) return;

        switch (e.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                if (yVelocity === 1) return;
                xVelocity = 0;
                yVelocity = -1;
                break;
            case 's':
            case '':
            case 'ArrowDown':
                if (yVelocity === -1) return;
                xVelocity = 0;
                yVelocity = 1;
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                if (xVelocity === 1) return;
                xVelocity = -1;
                yVelocity = 0;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                if (xVelocity === -1) return;
                xVelocity = 1;
                yVelocity = 0;
                break;
        }
    });

    document.addEventListener('click', (e) => {
        if (!shopBtn.contains(e.target) && !shopMenu.contains(e.target)) {
            shopMenu.style.display = 'none';
        }
    });

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    resetBestBtn.addEventListener('click', () => {
        localStorage.removeItem('bestScore');
        bestScore = 0;
        bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    });
    shopBtn.addEventListener('click', toggleShopMenu);

    bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    moneyDisplay.textContent = `💰 Money: ${money}`;
});