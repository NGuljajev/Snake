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
    let money = parseFloat(localStorage.getItem('money')) || 0;
    let gameSpeed = 150;
    let gameLoop;
    let gameRunning = false;
    let unlockedAchievements = JSON.parse(localStorage.getItem('achievements')) || [];

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

    const achievements = [
        { id: 'firstBlood', name: 'First Bite', description: 'Eat your first food item', condition: () => score >= 1 },
        { id: 'fiver', name: 'Nom Nom x5', description: 'Score 5 points in one game', condition: () => score >= 5 },
        { id: 'speedDemon', name: 'Speed Demon', description: 'Reach top speed (gameSpeed ≤ 50)', condition: () => gameSpeed <= 50 },
        { id: 'rich', name: 'Big Spender', description: 'Accumulate 500 money', condition: () => money >= 500 },
        { id: 'colorCollector', name: 'Color Collector', description: 'Buy 3 colors from shop', condition: () => boughtColors.filter(c => c !== 'Default').length >= 3 },
        { id: 'perfectionist', name: 'Perfectionist', description: 'Beat your best score', condition: () => score > bestScore },
    ];

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

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return gameOver();

        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) return gameOver();
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

            checkAchievements();
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
        const emojis = ['🍎', '🍉', '🥝', '🍇', '🍈', '🍋', '🍊', '🍋‍🟩', '🍌', '🍍', '🥭', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🍅', '🫒', '🥥',
            '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🥜', '🫘', '🌰', '🫚', '🫛', '🍄‍🟫',
            '🍕', '🍫', '🍬', '🍰', '🍦', '🍪', '🍮', '🍩', '🍭', '🍧', '🍨', '🎂', '🧁', '🥧', '🍯'];
        let x, y, overlap;
        do {
            x = Math.floor(Math.random() * tileCount);
            y = Math.floor(Math.random() * tileCount);
            overlap = snake.some(segment => segment.x === x && segment.y === y);
        } while (overlap);
        food = { x, y, emoji: emojis[Math.floor(Math.random() * emojis.length)], points: 1 };
    }

    function checkAchievements() {
        achievements.forEach((ach) => {
            if (!unlockedAchievements.includes(ach.id) && ach.condition()) {
                unlockedAchievements.push(ach.id);
                showAchievementToast(ach.name);
                saveAchievement(ach.id);
            }
        });
    }

    function showAchievementToast(name) {
        const toast = document.getElementById("achievement-toast");
        toast.textContent = `🏆 Achievement Unlocked: ${name}`;
        toast.style.display = "block";
        setTimeout(() => (toast.style.display = "none"), 3000);
    }

    function saveAchievement(id) {
        const unlocked = JSON.parse(localStorage.getItem("achievements")) || [];
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            localStorage.setItem("achievements", JSON.stringify(unlocked));
        }
    }

    function gameOver() {
        playCrashSound();
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
        gameSpeed = 150;
        gameRunning = true;
        gamePaused = false;

        scoreDisplay.textContent = `Score: ${score}`;
        bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
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
        shop.forEach(item => {
            const btn = document.createElement('button');
            const owned = boughtColors.includes(item.name);
            const selected = snakeColor.name === item.name;
            const affordable = money >= item.cost;

            btn.textContent = `${item.name} - ${item.cost} 💰 (x${item.multiplier})`;
            btn.style.backgroundColor = item.color;

            if (selected) {
                btn.disabled = true;
                btn.textContent += ' ✔️';
                btn.style.cursor = 'not-allowed';
                btn.style.opacity = '0.6';
            }
            if (!owned && !affordable) {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
                btn.style.opacity = '0.6';
            }

            btn.addEventListener('click', () => {
                if (!owned && !affordable) return;
                if (!owned) {
                    money -= item.cost;
                    boughtColors.push(item.name);
                    localStorage.setItem('boughtColors', JSON.stringify(boughtColors));
                }
                snakeColor = item;
                localStorage.setItem('selectedColor', item.name);
                moneyDisplay.textContent = `💰 Money: ${money.toFixed(1)}`;
                populateShopMenu();
            });

            shopMenu.appendChild(btn);
        });
        drawGame();
        if (gamePaused) drawPauseScreen();
    }

    function toggleShopMenu() {
        shopMenu.style.display = (shopMenu.style.display === 'block') ? 'none' : 'block';
        if (shopMenu.style.display === 'block') populateShopMenu();
    }

    document.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Space') {
            if (!gameRunning) startGame();
            else togglePause();
        }
        if (!gameRunning || gamePaused) return;
        switch (e.key) {
            case 'ArrowUp': case 'w': if (yVelocity !== 1) { xVelocity = 0; yVelocity = -1; } break;
            case 'ArrowDown': case 's': if (yVelocity !== -1) { xVelocity = 0; yVelocity = 1; } break;
            case 'ArrowLeft': case 'a': if (xVelocity !== 1) { xVelocity = -1; yVelocity = 0; } break;
            case 'ArrowRight': case 'd': if (xVelocity !== -1) { xVelocity = 1; yVelocity = 0; } break;
        }
    });

    document.addEventListener('click', e => {
        if (!shopBtn.contains(e.target) && !shopMenu.contains(e.target)) shopMenu.style.display = 'none';
    });

    startBtn.addEventListener('click', () => { playClickSound(); startGame(); });
    restartBtn.addEventListener('click', () => { playClickSound(); startGame(); });
    resetBestBtn.addEventListener('click', () => {
        localStorage.removeItem('bestScore');
        bestScore = 0;
        bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    });
    shopBtn.addEventListener('click', () => { playClickSound(); toggleShopMenu(); });

    bestScoreDisplay.textContent = `🏆 Best: ${bestScore}`;
    moneyDisplay.textContent = `💰 Money: ${money.toFixed(1)}`;
});

const eatSound = document.getElementById('eatSound');
const crashSound = document.getElementById('crashSound');
const clickSound = document.getElementById('clickSound');
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle');
let isMuted = true;

function playEatSound() { eatSound.currentTime = 0; eatSound.play(); }
function playCrashSound() { crashSound.currentTime = 0; crashSound.play(); }
function playClickSound() { clickSound.currentTime = 0; clickSound.play(); }

musicToggleBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    musicToggleBtn.textContent = isMuted ? '🔇 Music' : '🔊 Music';
    if (!isMuted && bgMusic.paused) bgMusic.play();
});

document.addEventListener('click', () => {
    if (!isMuted && bgMusic.paused) bgMusic.play();
}, { once: true });

document.getElementById("achievements-btn").addEventListener("click", () => {
    const menu = document.getElementById("achievements-menu");
    if (menu.style.display === "none" || menu.style.display === "") {
        renderAchievements();
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
});


function renderAchievements() {
    const achievements = [
        { id: 'firstBlood', name: 'First Bite' },
        { id: 'fiver', name: 'Nom Nom x5' },
        { id: 'speedDemon', name: 'Speed Demon' },
        { id: 'rich', name: 'Big Spender' },
        { id: 'colorCollector', name: 'Color Collector' },
        { id: 'perfectionist', name: 'Perfectionist' },
    ];
    const unlocked = JSON.parse(localStorage.getItem("achievements")) || [];

    const container = document.getElementById("achievements-menu");
    container.innerHTML = "<h3>Achievements</h3><ul>" +
        achievements.map(ach =>
            `<li>${unlocked.includes(ach.id) ? '✅' : '🔒'} ${ach.name}</li>`
        ).join('') +
        "</ul>";
}

localStorage.clear();
