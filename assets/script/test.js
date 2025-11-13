// On récupère l'image
const ship = document.getElementById("vaisseau");
let buttonStart = document.querySelector("#start");
let buttonRestart = document.querySelector("#restart");
let timerContainer = document.querySelector("#timerContainer")
const gameContainer = document.getElementById("gameContainer");
const mainAudio = new Audio("./assets/sounds/main-audio.mp3")
const destroyShip = new Audio("./assets/sounds/destroy.mp3");
const laser = new Audio("./assets/sounds/laser-gun.mp3")
const life = new Audio("./assets/sounds/life.mp3")

let timerInterval = null;

// Position du vaisseau
let x = 50;
let y = 90;
const vitesse = 2;

// Aliens
let alienList = [];
const alienCount = 6;
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
  switch (event.key) {
    case "ArrowRight":
      x += vitesse;
      break;
    case "ArrowLeft":
      x -= vitesse;
      break;
    case "ArrowUp":
      y -= vitesse;
      break;
    case "ArrowDown":
      y += vitesse;
      break;
  }
  ship.style.left = x + "%";
  ship.style.top = y + "%";

  x = Math.max(3, Math.min(98, x));
  y = Math.max(5, Math.min(98, y));
});

// ---------------------------------------------
// TIR
// ---------------------------------------------
document.addEventListener("keydown", (event) => {
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
  alienList.forEach((alien) => {
    alien.x += (Math.random() - 0.5) * 5;
    alien.x = Math.max(0, Math.min(90, alien.x));

    alien.y += 8;

    // Si un alien touche le bas → vie perdue
    if (alien.y > 750) {
      life.cloneNode().play()
      vies--;
      updateHUD();
      respawnAlien(alien);

      if (vies <= 0) {
        clearInterval(speed);
        mainAudio.pause();
        mainAudio.currentTime = 0
        // Affiche l'écran Game Over
        const gameOverScreen = document.querySelector(".game-over-screen");
        gameOverScreen.querySelector(".final-score").textContent = score;
        gameOverScreen.style.display = "flex";

      }
    }

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
// BOUTON START
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
  startTimer();
  // Déplacement aliens
  speed = setInterval(moveAliens, alienSpeed);
});



buttonRestart.addEventListener("click", function () {
  location.reload()
});

function startTimer() {
  clearInterval(timerInterval); // Stoppe l'ancien timer s'il existe

  let temps = 0;
  const timerElement = document.getElementById("timer");

  timerInterval = setInterval(() => {
    let minutes = parseInt(temps / 60, 10);
    let secondes = parseInt(temps % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    secondes = secondes < 10 ? "0" + secondes : secondes;

    timerElement.innerText = `${minutes}:${secondes}`;
    temps += 1; // Compte vers le haut
  }, 1000);
}
