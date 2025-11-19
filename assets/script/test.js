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
const fireButton = document.getElementById("fire-button");
const mainAudio = new Audio("./assets/sounds/main-audio.mp3")
const destroyShip = new Audio("./assets/sounds/destroy.mp3");
const laser = new Audio("./assets/sounds/laser-gun.mp3")
const life = new Audio("./assets/sounds/life.mp3")
const volumeSlider = document.getElementById("volumeControl");

// --- VARIABLES GLOBALES POUR JOYSTICK ---
const joystickZone = document.getElementById("joystick-zone");
const joystickHandle = document.getElementById("joystick-handle");
let joystickCenter = { x: 0, y: 0 };
let joystickActive = false;
const maxJoystickDistance = 75; // Correspond à la moitié de la taille du #joystick-zone (150px/2)
let movementInterval = null; // Pour le mouvement continu du vaisseau

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
// JOYSTICK VIRTUEL
// ---------------------------------------------

function handleJoystickStart(e) {
  if (isPaused) return;

  // On prend la position de la zone du joystick pour définir le centre de référence
  const rect = joystickZone.getBoundingClientRect();
  joystickCenter.x = rect.left + rect.width / 2;
  joystickCenter.y = rect.top + rect.height / 2;

  joystickActive = true;

  // Démarre l'intervalle qui va appliquer le mouvement au vaisseau 60 fois par seconde
  if (movementInterval === null) {
    movementInterval = setInterval(updateShipPositionFromJoystick, 1000 / 60); // ~60 FPS
  }

  // Gère le premier contact
  handleJoystickMove(e);
}

function handleJoystickMove(e) {
  if (!joystickActive) return;

  // Empêche le défilement de la page
  e.preventDefault();

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;

  // 1. Calcul du déplacement (delta) entre le doigt et le centre du joystick
  let deltaX = touchX - joystickCenter.x;
  let deltaY = touchY - joystickCenter.y;

  // 2. Calcul de la distance totale
  let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // 3. Limiter le manche (handle) à l'intérieur de la zone (clamping)
  if (distance > maxJoystickDistance) {
    let scale = maxJoystickDistance / distance;
    deltaX *= scale;
    deltaY *= scale;
    distance = maxJoystickDistance;
  }

  // Déplace visuellement le manche du joystick
  joystickHandle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

  // Stocke la vitesse et la direction normalisées (-1 à +1) dans un dataset
  joystickZone.dataset.speedX = deltaX / maxJoystickDistance;
  joystickZone.dataset.speedY = deltaY / maxJoystickDistance;
}

function handleJoystickEnd(e) {
  joystickActive = false;

  // Réinitialise la position du manche
  joystickHandle.style.transform = `translate(-50%, -50%)`;

  // Arrête le mouvement continu
  clearInterval(movementInterval);
  movementInterval = null;
  joystickZone.dataset.speedX = 0;
  joystickZone.dataset.speedY = 0;
}


// --- FONCTION D'APPLICATION DU MOUVEMENT (Le "Tick" du joystick) ---
function updateShipPositionFromJoystick() {
  const speedX = parseFloat(joystickZone.dataset.speedX) || 0;
  const speedY = parseFloat(joystickZone.dataset.speedY) || 0;

  // Vitesse de base du vaisseau, multipliée par l'intensité du joystick (entre 0 et 1)
  const moveAmountX = vitesse * speedX * 0.5;
  const moveAmountY = vitesse * speedY * 0.5;

  // Applique le mouvement au variables de position (x et y en %)
  x += moveAmountX;
  y += moveAmountY;

  // Applique le contrôle des limites
  x = Math.max(3, Math.min(98, x));
  y = Math.max(5, Math.min(98, y));

  // Mise à jour finale du DOM pour le vaisseau
  ship.style.left = x + "%";
  ship.style.top = y + "%";
}


// --- Écouteurs d'Événements du Joystick ---
joystickZone.addEventListener('touchstart', handleJoystickStart);
joystickZone.addEventListener('touchmove', handleJoystickMove);
joystickZone.addEventListener('touchend', handleJoystickEnd);
joystickZone.addEventListener('touchcancel', handleJoystickEnd); // Pour les interruptions
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
// TIR TACTILE
// ---------------------------------------------

fireButton.addEventListener('touchstart', (e) => {
  if (isPaused) return;

  // Empêche le comportement de clic par défaut
  e.preventDefault();

  laser.cloneNode().play();
  const shipRect = ship.getBoundingClientRect();
  const gameRect = gameContainer.getBoundingClientRect();

  const bullet = document.createElement("div");
  bullet.classList.add("bullet");

  // Copie de votre style de balle
  bullet.style.position = "absolute";
  bullet.style.width = "5px";
  bullet.style.height = "20px";
  bullet.style.background = "red";

  // Positionnement de la balle
  bullet.style.left = shipRect.left - gameRect.left + shipRect.width / 2 - 2.5 + "px";
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
  // Taille approximative du vaisseau
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
  isPaused = true;
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

volumeSlider.addEventListener("input", (e) => {
  mainAudio.volume = e.target.value; // règle le volume de la musique principale
});