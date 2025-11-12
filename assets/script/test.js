// On récupère l'image
const ship = document.getElementById("vaisseau");

// On définit une position de départ
let x = 50;
let y = 90;
const vitesse = 5; // Nombre de pixels par mouvement

// Écoute des touches du clavier
document.addEventListener("keydown", (event) => {
  // Vérifie quelle touche est pressée
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

  // Applique la nouvelle position à l'image
  ship.style.left = x + "%";
  ship.style.top = y + "%";
});
