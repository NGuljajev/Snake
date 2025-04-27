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

    const gridSize = 20;
    const tileCount = 20;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;

    let gamePaused = false;
    let snake = [{ x: 10, y: 10 }];
    let food = {};
    let xVelocity = 0;
    let yVelocity = 0;
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
    let money = parseInt(localStorage.getItem('money')) || 0;
    let gameSpeed = 150;
    let gameLoop;
    let gameRunning = false;

    const shop = [
        { name: 'Default', color: '#00FF00', multiplier: 1, cost: 0 },
        { name: 'Red', color: '#FF0000', multiplier: 1.2, cost: 100 },
        { name: 'Blue', color: '#0000FF', multiplier: 1.5, cost: 200 },
        { name: 'Gold', color: '#FFD700', multiplier: 1.7, cost: 350 },
        { name: 'Pink', color: '#f436ce', multiplier: 2, cost: 500 },
        { name: 'Cyan', color: '#00FFFF', multiplier: 2.5, cost: 750 },
    ];

    let boughtColors = JSON.parse(localStorage.getItem('boughtColors')) || ['Default'];
    let selectedColorName = localStorage.getItem('selectedColor') || 'Default';
    let snakeColor = shop.find(c => c.name === selectedColorName) || shop[0];

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFood();
        drawSnake();
    }

    function drawSnake() {
        ctx.fillStyle = snakeColor.color;
        for (let segment of snake) {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
    }

    function drawFood() {
        if (!food || !food.emoji) return;
        ctx.font = `${gridSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.emoji, food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2);
    }

    function moveSnake() {
        const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            playEatSound();
            score += food.points;
            money = parseFloat((money + food.points * snakeColor.multiplier).toFixed(1));

            scoreDisplay.textContent = `Score: ${Math.floor(score)}`;
            moneyDisplay.textContent = `💰 Money: ${money.toFixed(1)}`;

            if (score > bestScore) {
                bestScore = Math.floor(score);
                localStorage.setItem('bestScore', bestScore);
                bestScoreDisplay.textContent = `Best: ${bestScore}`;
            }

            generateFood();

            if (Math.floor(score) % 5 === 0 && gameSpeed > 50) {
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

        let type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        let newFood = {
            ...type,
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
        };

        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                return generateFood();
            }
        }

        food = newFood;
    }

    function playCrashSound() {
        crashSound.currentTime = 0;
        crashSound.play();
    }

    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    function playEatSound() {
        eatSound.currentTime = 0;
        eatSound.play();
    }

    function gameOver() {
        crashSound.currentTime = 0;
        crashSound.play();
        gameRunning = false;
        clearInterval(gameLoop);

        gameOverDisplay.style.display = 'flex';
        restartBtn.style.display = 'block';

        document.getElementById('final-score').textContent = `Your Score: ${score}`;
        document.getElementById('best-score-end').textContent = `Best Score: ${bestScore}`;

        localStorage.setItem('money', money);
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
            const owned = boughtColors.includes(item.name);
            const selected = snakeColor.name === item.name;
            const affordable = money >= item.cost;

            button.textContent = `${item.name} - ${item.cost} 💰 (x${item.multiplier})`;
            button.style.backgroundColor = item.color;

            // Style for selected
            if (selected) {
                button.disabled = true;
                button.textContent += ' ✔️';
                button.style.cursor = 'not-allowed';
                button.style.opacity = '0.6';
            }

            // Style for not owned and not affordable
            if (!owned && !affordable) {
                button.disabled = true;
                button.style.cursor = 'not-allowed';
                button.style.opacity = '0.6';
            }

            // Click logic
            button.addEventListener('click', () => {
                if (!owned && !affordable) return;

                if (!owned) {
                    money -= item.cost;
                    boughtColors.push(item.name);
                    localStorage.setItem('boughtColors', JSON.stringify(boughtColors));
                }

                snakeColor = item;
                localStorage.setItem('selectedColor', item.name);
                moneyDisplay.textContent = `💰 Money: ${money}`;
                populateShopMenu();
            });

            shopMenu.appendChild(button);
        });
        drawGame();
    }


    function toggleShopMenu() {
        if (shopMenu.style.display === 'none' || shopMenu.style.display === '') {
            populateShopMenu();
            shopMenu.style.display = 'block';
        } else {
            shopMenu.style.display = 'none';
        }
    }

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
                if (yVelocity !== 1) {
                    xVelocity = 0;
                    yVelocity = -1;
                }
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                if (yVelocity !== -1) {
                    xVelocity = 0;
                    yVelocity = 1;
                }
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                if (xVelocity !== 1) {
                    xVelocity = -1;
                    yVelocity = 0;
                }
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                if (xVelocity !== -1) {
                    xVelocity = 1;
                    yVelocity = 0;
                }
                break;
        }
    });

    document.addEventListener('click', (e) => {
        if (!shopBtn.contains(e.target) && !shopMenu.contains(e.target)) {
            shopMenu.style.display = 'none';
        }
    });

    startBtn.addEventListener('click', () => {
        playClickSound();
        startGame();
    });
    
    restartBtn.addEventListener('click', () => {
        playClickSound();
        startGame();
    });
    resetBestBtn.addEventListener('click', () => {
        localStorage.removeItem('bestScore');
        bestScore = 0;
        bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    });
    shopBtn.addEventListener('click', () => {
        playClickSound();
        toggleShopMenu();
    });

    bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    moneyDisplay.textContent = `💰 Money: ${money}`;
});

// Music Control
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle');

let isMuted = true;

musicToggleBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    musicToggleBtn.textContent = isMuted ? '🔇 Music' : '🔊 Music';

    if (!isMuted && bgMusic.paused) {
        bgMusic.play();
    }
});

// Optional: Unmute on first interaction (user gesture required)
document.addEventListener('click', () => {
    if (isMuted === false && bgMusic.paused) {
        bgMusic.play();
    }
}, { once: true });

const eatSound = document.getElementById('eatSound');
const crashSound = document.getElementById('crashSound');
const clickSound = document.getElementById('clickSound');

function playEatSound() {
    eatSound.currentTime = 0;
    eatSound.play();
}