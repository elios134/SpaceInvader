// On récupère l'image
const ship = document.getElementById("vaisseau");
let buttonStart = document.querySelector("#start");
let buttonRestart = document.querySelector("#restart");
let buttonPause = document.querySelector("#pause")
let buttonPlay = document.querySelector("#play")
let timerContainer = document.querySelector("#timerContainer")
const gameContainer = document.getElementById("gameContainer");
const gamePauseScreen = document.querySelector(".game-pause-screen");
const gameOverScreen = document.querySelector(".game-over-screen");

const mainAudio = new Audio("./assets/sounds/main-audio.mp3")
const destroyShip = new Audio("./assets/sounds/destroy.mp3");
const laser = new Audio("./assets/sounds/laser-gun.mp3")
const life = new Audio("./assets/sounds/life.mp3")


// ---------------------------------------------
// VARIABLES GLOBALES
// ---------------------------------------------
let timerInterval = null
let temps = 0;
let isPaused = false;


// Position du vaisseau
let x = 50;
let y = 90;
const vitesse = 5;

// Aliens
let alienList = [];
let alienCount = 5;
let speed;
let alienSpeed = 300;

// HUD
let score = 0;
let vies = 5;

// --- HUD UPDATE ---
function updateHUD() {
  document.getElementById("hud-score").textContent = "Score : " + score;
  document.getElementById("hud-lives").textContent = "Vies : " + "❤".repeat(vies);
}
// ---------------------------------------------
// MOUVEMENT VAISSEAU
// ---------------------------------------------
document.addEventListener("keydown", (event) => {
  if (isPaused && event.code !== "Escape") {
    return; // On bloque tout sauf "Escape"
  }
  switch (event.key) {
    case "ArrowRight":
      x += vitesse;
      break;
    case "d":
      x += vitesse;
      break

    case "ArrowLeft":
      x -= vitesse;
      break;
    case "q":
      x -= vitesse;
      break;

    case "ArrowUp":
      y -= vitesse;
      break;
    case "z":
      y -= vitesse;
      break;

    case "ArrowDown":
      y += vitesse;
      break;
    case "s":
      y += vitesse;
      break;
  }
  if (event.code === "Space") {
    laser.cloneNode().play()
    const shipRect = ship.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();

    const bullet = document.createElement("div");
    bullet.classList.add("bullet");

    bullet.style.position = "absolute";
    bullet.style.width = "5px";
    bullet.style.height = "20px";
    bullet.style.background = "red";

    bullet.style.left =
      shipRect.left - gameRect.left + shipRect.width / 2 - 2.5 + "px";
    bullet.style.top = shipRect.top - gameRect.top - 20 + "px";

    gameContainer.appendChild(bullet);

    let bulletInterval = setInterval(() => {
      let top = parseInt(bullet.style.top);
      bullet.style.top = top - 10 + "px";

      detectBulletCollision(bullet, bulletInterval);

      if (top < 0) {
        bullet.remove();
        clearInterval(bulletInterval);
      }
    }, 20);
  }
  ship.style.left = x + "%";
  ship.style.top = y + "%";

  x = Math.max(3, Math.min(98, x));
  y = Math.max(5, Math.min(98, y));
});

// ---------------------------------------------
// ALIENS
// ---------------------------------------------
function spawnAliens() {
  for (let i = 0; i < alienCount; i++) {
    const alien = document.createElement("img");
    alien.src = "assets/imgs/alien.png";
    alien.classList.add("alien");
    alien.style.position = "absolute";
    alien.style.width = "50px";
    alien.style.left = Math.random() * 90 + "%";
    alien.style.top = "0px";

    gameContainer.appendChild(alien);

    alienList.push({
      element: alien,
      x: Math.random() * 90,
      y: 0
    });
  }
}

function moveAliens() {
  // Taille approximative du vaisseau (à ajuster si besoin)
  const shipWidth = 60;  // en px
  const shipHeight = 64; // en px

  // Convertir les % en px pour collision
  const shipX_px = (x / 100) * window.innerWidth;
  const shipY_px = (y / 100) * window.innerHeight;

  alienList.forEach((alien) => {

    // --- MOUVEMENT ALIEN ---
    alien.x += (Math.random() - 0.5) * 5;
    alien.x = Math.max(0, Math.min(90, alien.x));
    alien.y += 8;

    // Position alien convertie en px
    const alienX_px = (alien.x / 100) * window.innerWidth;
    const alienY_px = alien.y;

    // Dimensions de l'alien
    const alienWidth = alien.width || 50;
    const alienHeight = alien.height || 50;

    // --- COLLISION ALIEN / VAISSEAU ---
    if (
      alienX_px < shipX_px + shipWidth &&
      alienX_px + alienWidth > shipX_px &&
      alienY_px < shipY_px + shipHeight &&
      alienY_px + alienHeight > shipY_px
    ) {
      // Collision !
      life.cloneNode().play();
      vies--;
      updateHUD();
      respawnAlien(alien);

      if (vies <= 0) {
        gameOver()
      }
    }

    // --- SI ALIEN TOUCHE LE BAS ---
    if (alien.y > window.innerHeight - 100) {
      life.cloneNode().play();
      vies--;
      updateHUD();
      respawnAlien(alien);

      if (vies <= 0) {
        gameOver()
      }
    }

    // --- Mise à jour DOM ---
    alien.element.style.left = alien.x + "%";
    alien.element.style.top = alien.y + "px";
  });
}




function respawnAlien(alien) {
  alien.x = Math.random() * 90;
  alien.y = 0;
  alien.element.style.left = alien.x + "%";
  alien.element.style.top = alien.y + "px";
}

// ---------------------------------------------
// COLLISION TIR ↔ ALIEN
// ---------------------------------------------
function detectBulletCollision(bullet, interval) {
  const bulletRect = bullet.getBoundingClientRect();

  alienList.forEach((alien) => {
    const alienRect = alien.element.getBoundingClientRect();

    const touche =
      bulletRect.top < alienRect.bottom &&
      bulletRect.bottom > alienRect.top &&
      bulletRect.left < alienRect.right &&
      bulletRect.right > alienRect.left;

    if (touche) {
      destroyShip.cloneNode().play()
      // --- BONUS +1 POSITIONNÉ SUR L'ALIEN ---
      const bonus = document.createElement("p");
      bonus.textContent = "+10";
      bonus.style.color = "green";
      bonus.style.position = "absolute";
      bonus.style.left = alien.element.style.left;
      bonus.style.top = alien.element.style.top;
      bonus.style.transform = "translate(-50%, -50%)";
      bonus.style.fontSize = "25px";
      bonus.style.fontWeight = "700";
      gameContainer.appendChild(bonus);

      setTimeout(() => bonus.remove(), 500);

      // --- COLLISION ---
      alien.element.style.display = "none";
      bullet.remove();
      clearInterval(interval);

      score += 10;
      updateHUD();

      setTimeout(() => {
        alien.element.style.display = "block";
        respawnAlien(alien);
      }, 300);
    }
  });
}
// ---------------------------------------------
// GAME OVER
// ---------------------------------------------
function gameOver() {
  clearInterval(speed);
  clearInterval(timerInterval);
  mainAudio.pause();
  mainAudio.currentTime = 0;
  gameOverScreen.querySelector(".final-score").textContent = score;
  gameOverScreen.style.display = "flex";
}
// ---------------------------------------------
// BOUTON START/RESTART/PAUSE/PLAY
// ---------------------------------------------
buttonStart.addEventListener("click", function () {
  gameContainer.style.display = "block";
  mainAudio.play()
  mainAudio.loop = true
  const gameStartscreen = document.querySelector('.game-start-screen')
  gameStartscreen.style.display = "none"

  // Vies, score, timer reset
  score = 0;
  timer = 0;
  updateHUD();
  // Aliens générés une seule fois
  if (alienList.length === 0) spawnAliens();

  // Timer
  temps = 60
  startTimer();
  // Déplacement aliens
  speed = setInterval(moveAliens, alienSpeed);
});

buttonRestart.addEventListener("click", function () {
  location.reload()
});

buttonPause.addEventListener("click", pause)
function pause() {
  isPaused = true;
  clearInterval(speed);
  clearInterval(timerInterval)
  mainAudio.pause();
  mainAudio.currentTime = 0
  gamePauseScreen.style.display = "flex";
}
buttonPlay.addEventListener("click", function () {
  play()
})
function play() {
  isPaused = false;
  gamePauseScreen.style.display = "none"
  speed = setInterval(moveAliens, alienSpeed);
  mainAudio.play()
  mainAudio.loop = true
  startTimer()
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Escape") {
    if (isPaused) {
      play();     // Reprendre
    } else {
      pause();    // Mettre en pause
    }
  }
});

// ---------------------------------------------
// FONCTION TIMER
// ---------------------------------------------

function startTimer() {
  clearInterval(timerInterval); // Stoppe l'ancien timer s'il existe
  const timerElement = document.getElementById("timer");

  timerInterval = setInterval(() => {
    let minutes = parseInt(temps / 60, 10);
    let secondes = parseInt(temps % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    secondes = secondes < 10 ? "0" + secondes : secondes;

    timerElement.innerText = `${minutes}:${secondes}`;

    if (temps <= 0) {
      clearInterval(timerInterval);
      gameOver();
      return;
    }

    temps--;
  }, 1000);
}

const volumeSlider = document.getElementById("volumeControl");

volumeSlider.addEventListener("input", (e) => {
  mainAudio.volume = e.target.value; // règle le volume de la musique principale
});

