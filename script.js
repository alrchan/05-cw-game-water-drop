// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let harmfulDropMaker; // Timer for harmful drops
let timerInterval; // Timer for countdown
let timeLeft = 120; // Time in seconds
let score = 0; // Track the score
let dropSpeedMultiplier = 1; // Base speed multiplier
let baseDropMultiplier = 1; // multiplier set by difficulty (easy/medium/hard)

// Player movement variables
const playerSpeed = 25; // Pixels to move per keypress
const player = document.getElementById('player');
let playerPosition = 50; // Starting position (percentage)

// Function to reset the game
function resetGame() {
    // Fully stop the game and clear running timers/animations
    gameRunning = false;

    clearInterval(dropMaker);
    clearInterval(harmfulDropMaker);
    clearInterval(timerInterval);
    dropMaker = null;
    harmfulDropMaker = null;
    timerInterval = null;

    // Remove game over or victory displays
    const gameOver = document.querySelector('.game-over');
    if (gameOver) gameOver.remove();

    // Remove visual effects (confetti, flash)
    document.querySelectorAll('.confetti, .flash-effect').forEach(el => el.remove());

    // Reset all variables
    score = 0;
    timeLeft = 120;
    dropSpeedMultiplier = 1;
    baseDropMultiplier = 1;

    // Update displays
    const scoreEl = document.getElementById('score');
    const timeEl = document.getElementById('time');
    if (scoreEl) scoreEl.textContent = '0';
    if (timeEl) timeEl.textContent = '120';

    // Remove any remaining drops
    const drops = document.querySelectorAll('.water-drop, .harmful-drop');
    drops.forEach(drop => drop.remove());

    // Reset player position (center)
    if (player) {
        player.style.left = '50%';
        playerPosition = 50;
    }
}

// Function to end the game with a loss
function endGameWithLoss() {
    gameRunning = false;
    
    // Clear all intervals
    clearInterval(dropMaker);
    clearInterval(harmfulDropMaker);
    clearInterval(timerInterval);
    
    // Remove all existing drops
    const drops = document.querySelectorAll('.water-drop, .harmful-drop');
    drops.forEach(drop => drop.remove());
    
    // Display loss message and reset button
    const gameOver = document.createElement('div');
    gameOver.className = 'game-over';
    gameOver.innerHTML = `
        <h2 style="color: #F5402C;">You Lost!</h2>
        <p>Poisoned by Dark Drop</p>
        <button class="reset-button">Try Again</button>
    `;
    
    // Add reset button click handler
    gameOver.querySelector('.reset-button').addEventListener('click', () => {
        resetGame();
        startGame();
    });
    
    document.getElementById('game-container').appendChild(gameOver);
}

// Function to end the game normally
function endGame() {
    gameRunning = false;
    
    // Clear all intervals
    clearInterval(dropMaker);
    clearInterval(harmfulDropMaker);
    clearInterval(timerInterval);
    
    // Remove all existing drops
    const drops = document.querySelectorAll('.water-drop, .harmful-drop');
    drops.forEach(drop => drop.remove());
    
    // Display final score and reset button
    const gameOver = document.createElement('div');
    gameOver.className = 'game-over';
    gameOver.innerHTML = `
        <h2>Game Over!</h2>
        <p>Final Score: ${score}</p>
        <button class="reset-button">Reset Game</button>
    `;
    
    // Add reset button click handler
    gameOver.querySelector('.reset-button').addEventListener('click', () => {
        resetGame();
        startGame();
    });
    
    document.getElementById('game-container').appendChild(gameOver);
}

// Function to update the timer
function updateTimer() {
    timeLeft--;
    document.getElementById('time').textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

// Function to update drop speed based on score
function updateDropSpeed() {
    // start with base multiplier determined by difficulty
    dropSpeedMultiplier = baseDropMultiplier;
    if (score >= 30) {
        dropSpeedMultiplier = baseDropMultiplier * 1.25; // 25% faster at score 30
    }
    if (score >= 50) {
        dropSpeedMultiplier = baseDropMultiplier * 1.5;  // Another 25% faster at score 50
    }
}

// Function to check collision between two elements
function checkCollision(dropElement, playerElement) {
    const drop = dropElement.getBoundingClientRect();
    const player = playerElement.getBoundingClientRect();

    return !(
        drop.bottom < player.top ||
        drop.top > player.bottom ||
        drop.right < player.left ||
        drop.left > player.right
    );
}

// Function to create flash effect
function createFlashEffect(isHarmful = false) {
    const flash = document.createElement('div');
    flash.className = 'flash-effect';
    if (isHarmful) {
        flash.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Red flash for harmful drops
    }
    document.body.appendChild(flash);
    
    // Remove the flash element after animation completes
    setTimeout(() => {
        flash.remove();
    }, 1000);
}

// Function to decrement score
function decrementScore() {
    score--;
    document.getElementById('score').textContent = Math.max(0, score);
    createFlashEffect(true);
    
    // Check if score went below 0
    if (score < 0) {
        endGameWithLoss();
    }
}

// Function to create confetti
function createConfetti() {
    const colors = ['#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53', '#FF902A', '#F5402C'];
    const confettiCount = 100;
    const container = document.getElementById('game-container');
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random properties for each confetti piece
        const color = colors[Math.floor(Math.random() * colors.length)];
        const leftPos = Math.random() * 100;
        const fallDuration = 1 + Math.random() * 2;
        const rotation = Math.random() * 360;
        
        confetti.style.setProperty('--color', color);
        confetti.style.setProperty('--fall-duration', `${fallDuration}s`);
        confetti.style.setProperty('--rotation', `${rotation}deg`);
        confetti.style.left = `${leftPos}%`;
        
        container.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => confetti.remove(), fallDuration * 1000);
    }
}

// Function to show victory message
function showVictoryMessage() {
    const victoryMessage = document.createElement('div');
    victoryMessage.className = 'victory-message game-over';
    victoryMessage.textContent = 'Congrats, you win!';
    document.getElementById('game-container').appendChild(victoryMessage);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        victoryMessage.remove();
    }, 3000);
}

// Function to update score
function updateScore() {
    score++;
    document.getElementById('score').textContent = score;
    createFlashEffect();
    updateDropSpeed(); // Check if we need to increase speed
    
    // Check for victory condition
    if (score === 50) {
        createConfetti();
        showVictoryMessage();
        setTimeout(() => {
            endGame();
        }, 3000);
    }
}

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
// Attach reset button
const resetBtn = document.getElementById('reset-btn');
if (resetBtn) resetBtn.addEventListener('click', () => {
    resetGame();
});

function showGoalMessage() {
    const goalMessage = document.createElement('div');
    goalMessage.className = 'goal-message';
    
    const goalText = document.createElement('div');
    goalText.textContent = 'Your Goal: Collect 50 Waterdrops';
    
    const warningText = document.createElement('div');
    warningText.className = 'warning';
    warningText.textContent = 'Warning: Avoid Dark Green Drops (Poison!)';
    
    goalMessage.appendChild(goalText);
    goalMessage.appendChild(warningText);
    document.getElementById('game-container').appendChild(goalMessage);

    // Remove the message after animation completes (increased time to read both messages)
    setTimeout(() => {
        goalMessage.remove();
    }, 3000);
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Remove any existing game over display
  const existingGameOver = document.querySelector('.game-over');
  if (existingGameOver) {
    existingGameOver.remove();
  }

  // Reset score, speed and timer
  score = 0;
    dropSpeedMultiplier = 1;
  timeLeft = 120;
  document.getElementById('score').textContent = '0';
  document.getElementById('time').textContent = '120';
  
  gameRunning = true;

  // Show goal message
  showGoalMessage();

    // Read difficulty selection and set base multiplier
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'medium';
    if (difficulty === 'easy') baseDropMultiplier = 0.8; // slower
    else if (difficulty === 'hard') baseDropMultiplier = 1.25; // faster than medium
    else baseDropMultiplier = 1; // medium
    // apply base to current drop speed
    dropSpeedMultiplier = baseDropMultiplier;

  // Start the timer
  timerInterval = setInterval(updateTimer, 1000);

  // Create new regular drops every second (1000 milliseconds)
  dropMaker = setInterval(() => createDrop(false), 1000);
  
  // Create harmful drops less frequently (every 2.5 seconds)
  harmfulDropMaker = setInterval(() => createDrop(true), 2500);
}

function createDrop(isHarmful = false) {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = isHarmful ? "harmful-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall with speed based on multiplier (base time is 4 seconds)
  const fallDuration = 4 / dropSpeedMultiplier;
  drop.style.animationDuration = `${fallDuration}s`;

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Set up collision detection interval
  const collisionCheck = setInterval(() => {
    if (checkCollision(drop, player)) {
      if (drop.className === 'harmful-drop') {
        decrementScore();
      } else {
        updateScore();
      }
      drop.remove();
      clearInterval(collisionCheck);
    }
  }, 100); // Check every 100ms

  // Remove drops that reach the bottom (weren't caught)
  drop.addEventListener("animationend", () => {
    clearInterval(collisionCheck);
    drop.remove(); // Clean up drops that weren't caught
  });
}

// Handle keyboard controls
document.addEventListener('keydown', (e) => {
  const gameWidth = document.getElementById('game-container').offsetWidth;
  const playerWidth = player.offsetWidth;
  const maxPosition = gameWidth - playerWidth;
  const moveAmount = playerSpeed;
  
  let currentPosition = parseInt(player.style.left || '0');
  
  if (e.key === 'ArrowLeft') {
    currentPosition = Math.max(0, currentPosition - moveAmount);
  } else if (e.key === 'ArrowRight') {
    currentPosition = Math.min(maxPosition, currentPosition + moveAmount);
  }
  
  player.style.left = `${currentPosition}px`;
});

// Handle mouse hover controls
const gameContainer = document.getElementById('game-container');
gameContainer.addEventListener('mousemove', (e) => {
  const gameRect = gameContainer.getBoundingClientRect();
  const playerWidth = player.offsetWidth;
  const maxPosition = gameRect.width - playerWidth;
  
  // Calculate mouse position relative to game container
  let mouseX = e.clientX - gameRect.left;
  
  // Center the player on the mouse
  mouseX = mouseX - (playerWidth / 2);
  
  // Constrain to game container bounds
  mouseX = Math.max(0, Math.min(maxPosition, mouseX));
  
  player.style.left = `${mouseX}px`;
});
