// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly

let score = 0;
let timer = 30;
let timerInterval;

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");

// End messages
const winMessages = [
  "Amazing! You brought clean water! 💧",
  "You did it! Lives changed!",
  "Water hero! Great job!",
  "Victory! Every drop counts!"
];
const loseMessages = [
  "Try again! More drops needed.",
  "Almost there! Give it another go!",
  "Keep going! Every drop helps.",
  "Don't give up! Try once more!"
];

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

// Add Reset button logic
const resetBtn = document.createElement("button");
resetBtn.id = "reset-btn";
resetBtn.textContent = "Reset";
resetBtn.style.marginLeft = "10px";
document.querySelector(".score-panel").appendChild(resetBtn);
resetBtn.addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timer = 30;
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timer;
  clearDrops();
  hideEndMessage();
  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 500);
  timerInterval = setInterval(updateTimer, 1000);
  obstacleInterval = setInterval(createObstacle, 5000);
}

function updateTimer() {
  timer--;
  timerDisplay.textContent = timer;
  if (timer <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearInterval(obstacleInterval);
  showEndMessage();
}

function clearDrops() {
  gameContainer.innerHTML = "";
}

function showEndMessage() {
  let msg;
  let isWin = false;
  if (score >= 20) {
    msg = winMessages[Math.floor(Math.random() * winMessages.length)];
    isWin = true;
  } else {
    msg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
  }
  let msgDiv = document.getElementById("end-message");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "end-message";
    msgDiv.className = "end-message";
    document.body.appendChild(msgDiv);
  }
  msgDiv.textContent = msg + ` (Score: ${score})`;
  msgDiv.style.display = "block";
  if (isWin) launchConfetti();
}

function hideEndMessage() {
  const msgDiv = document.getElementById("end-message");
  if (msgDiv) msgDiv.style.display = "none";
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearInterval(obstacleInterval);
  score = 0;
  timer = 30;
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timer;
  clearDrops();
  hideEndMessage();
}

// Track mouse position for collision with obstacle
let mouseX = 0, mouseY = 0;
gameContainer.addEventListener('mousemove', function(e) {
  const rect = gameContainer.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function createObstacle() {
  const obstacle = document.createElement("div");
  obstacle.className = "obstacle-pipe";
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 80);
  obstacle.style.left = xPosition + "px";
  obstacle.style.top = "-40px";
  gameContainer.appendChild(obstacle);
  obstacle.style.animation = "obstacleFall 3s linear forwards";
  // Remove if animation ends (falls through bottom)
  obstacle.addEventListener("animationend", () => {
    obstacle.remove();
  });
  // Collision detection with cursor
  const checkCollision = setInterval(() => {
    if (!gameRunning) { clearInterval(checkCollision); return; }
    const obsRect = obstacle.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();
    // Mouse position relative to viewport
    const absMouseX = mouseX + gameRect.left;
    const absMouseY = mouseY + gameRect.top;
    if (
      absMouseX >= obsRect.left && absMouseX <= obsRect.right &&
      absMouseY >= obsRect.top && absMouseY <= obsRect.bottom
    ) {
      score = Math.max(0, score - 2);
      scoreDisplay.textContent = score;
      obstacle.remove();
      clearInterval(checkCollision);
    }
    // Remove if animation ends
    if (!document.body.contains(obstacle)) {
      clearInterval(checkCollision);
    }
  }, 30);
}

// Confetti effect for win
function launchConfetti() {
  for (let i = 0; i < 80; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.animationDuration = (Math.random()*1+1.5) + "s";
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 2000);
  }
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  // 25% chance for a bad (dirty) drop
  const isBad = Math.random() < 0.25;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add click event for scoring
  drop.addEventListener("click", function() {
    if (!gameRunning) return;
    if (isBad) {
      score = Math.max(0, score - 1);
    } else {
      score++;
    }
    scoreDisplay.textContent = score;
    drop.remove();
  });

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
