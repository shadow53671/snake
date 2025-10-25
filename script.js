// =================================================
// JAVASCRIPT: OYUN MANTIĞI VE SKOR KAYDI
// =================================================

// --- OYUN AYARLARI ---
const BOARD_SIZE = 20;
const GAME_SPEED = 150; // ms cinsinden (ne kadar küçükse o kadar hızlı)
const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score-display');
const highscoresList = document.getElementById('highscores-list');
const startButton = document.getElementById('startButton');
const usernameInput = document.getElementById('username');
const gameOverMessage = document.getElementById('game-over-message');
const finalScore = document.getElementById('final-score');

let snake = [{ x: 10, y: 10 }];
let food = {};
let direction = 'right';
let isRunning = false;
let score = 0;
let gameInterval;
let username = '';

// --- BAŞLANGIÇ VE YÜKLEME ---

// Oyun tahtasını oluşturur (20x20)
function createBoard() {
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 20px)`;
    board.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 20px)`;
    
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        board.appendChild(cell);
    }
    board.style.display = 'grid';
}

// Yem için rastgele pozisyon üretir
function createFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

// Oyunu başlatır
function startGame() {
    username = usernameInput.value.trim();
    if (!username) {
        alert("Lütfen kullanıcı adınızı giriniz!");
        return;
    }
    
    if (isRunning) return;

    // Oyunu sıfırla
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    scoreDisplay.textContent = 'Puan: 0';
    isRunning = true;
    gameOverMessage.style.display = 'none';
    usernameInput.disabled = true;
    startButton.disabled = true;

    createFood();
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

// --- OYUN MANTIĞI ---

// Oyunun ana döngüsü
function gameLoop() {
    if (!isRunning) return;

    // Yeni kafa pozisyonunu hesapla
    const head = snake[0];
    let newHead = { x: head.x, y: head.y };

    switch (direction) {
        case 'up': newHead.y--; break;
        case 'down': newHead.y++; break;
        case 'left': newHead.x--; break;
        case 'right': newHead.x++; break;
    }

    // 1. Çarpışma Kontrolü (Duvarlar ve Kendi Kuyruğu)
    if (newHead.x < 0 || newHead.x >= BOARD_SIZE ||
        newHead.y < 0 || newHead.y >= BOARD_SIZE ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        
        endGame();
        return;
    }

    // Yeni kafayı ekle
    snake.unshift(newHead);

    // 2. Yem Kontrolü
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        scoreDisplay.textContent = `Puan: ${score}`;
        createFood(); // Yeni yem oluştur
    } else {
        snake.pop(); // Yemi yemediyse kuyruğu hareket ettir
    }

    drawGame(); // Ekranı yeniden çiz
}

// --- ÇİZİM İŞLEMLERİ ---

function drawGame() {
    // Tüm hücreleri temizle
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('snake', 'food');
    });

    // Yılanı çiz
    snake.forEach(segment => {
        const index = segment.y * BOARD_SIZE + segment.x;
        if (cells[index]) {
            cells[index].classList.add('snake');
        }
    });

    // Yemi çiz
    const foodIndex = food.y * BOARD_SIZE + food.x;
    if (cells[foodIndex]) {
        cells[foodIndex].classList.add('food');
    }
}

// --- OYUN SONU VE SKOR ---

function endGame() {
    clearInterval(gameInterval);
    isRunning = false;
    usernameInput.disabled = false;
    startButton.disabled = false;
    
    // Son skoru göster
    finalScore.textContent = `Puanınız: ${score}`;
    gameOverMessage.style.display = 'block';

    // Skoru kaydet
    saveHighscore(username, score);
    renderHighscores();
}


// --- YÖN KONTROLÜ ---

document.addEventListener('keydown', (e) => {
    if (!isRunning) return;

    // Aynı yöne veya tam ters yöne gitmeyi engelle
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
});

// --- SKOR TABLOSU (Local Storage) ---

function getHighscores() {
    const scoresJson = localStorage.getItem('snake_highscores');
    return scoresJson ? JSON.parse(scoresJson) : [];
}

function saveHighscore(user, finalScore) {
    if (finalScore === 0) return; // Skor 0 ise kaydetme

    const highscores = getHighscores();
    highscores.push({ user, score: finalScore });
    
    // Skorları büyükten küçüğe sırala ve ilk 10'u tut
    highscores.sort((a, b) => b.score - a.score);
    const topScores = highscores.slice(0, 10);

    localStorage.setItem('snake_highscores', JSON.stringify(topScores));
}

function renderHighscores() {
    const highscores = getHighscores();
    highscoresList.innerHTML = '';
    
    if (highscores.length === 0) {
        highscoresList.innerHTML = '<li>Henüz skor yok. İlk sen oyna!</li>';
        return;
    }

    highscores.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${index + 1}.</strong> ${item.user} - <span style="color:#f1c40f;">${item.score}</span>`;
        highscoresList.appendChild(li);
    });
}

// --- BAŞLATMA ---

startButton.addEventListener('click', startGame);

// Sayfa yüklendiğinde tahtayı ve skorları hazırla
document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    renderHighscores();
});