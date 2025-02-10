const canvas = document.createElement("canvas"); 
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 400;

// Load character sprite frames
const playerSprites = {
    idle1: new Image(),
    idle2: new Image(),
    walk1: new Image(),
    walk2: new Image(),
};

playerSprites.idle1.src = "Hat_man3.png";  // First idle frame
playerSprites.idle2.src = "Hat_man2.png";  // Second idle frame
playerSprites.walk1.src = "Hat_man1.png"; // First walking frame
playerSprites.walk2.src = "Hat_man2.png"; // Second walking frame

// Load background image
const backgroundImage = new Image();
backgroundImage.src = "background.jpg";  // Path to your background image

// Load NPC GIF
const npcGif = new Image();
npcGif.src = "anduFace.png";  // Path to your NPC GIF

// Background Music
const backgroundMusic = new Audio("streamBirds1.wav"); // Replace with your actual file
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

// Start music when the user interacts (fixes autoplay issues)
window.addEventListener("click", () => {
    backgroundMusic.play();
}, { once: true });



// Player setup
const player = {
    x: 50,
    y: 300,
    width: 128,
    height: 128,
    velocityY: 0,
    gravity: 0.8,
    jumpPower: -10,
    grounded: false,
    speed: 5,
    currentFrame: "idle1",  // Start with idle1
    frameCounter: 0,  // To track frame switching
};

// Keyboard input
const keys = {};

// Ground setup
const ground = { x: 0, y: 350, width: canvas.width, height: 50, color: "green" };

// NPC Block setup
const npcBlocks = [];
const walkingNPCs = [];  // NPCs that walk across the bottom
const floatingNPCs = []; // NPCs that will float

// Function to create new NPC Block
function spawnNPC() {
    const npc = {
        x: Math.random() * (canvas.width - 50),  // Random X position
        y: Math.random() * (canvas.height - 100), // Random Y position
        width: 100,
        height: 100,
        speed: 2 + Math.random() * 3, // Random speed between 2 and 5
        direction: Math.random() < 0.5 ? 1 : -1, // Random direction (left or right)
        spawnTime: Date.now(), // Track when the NPC was spawned
    };
    npcBlocks.push(npc);
}

// Function to update NPC movement and remove after 4 seconds
function updateNPCs() {
    const currentTime = Date.now();
    
    // Filter out NPCs older than 4 seconds
    npcBlocks.forEach((npc, index) => {
        if (currentTime - npc.spawnTime > 8000) {
            npcBlocks.splice(index, 1); // Remove NPC after 4 seconds
        } else {
            // Move the NPC left or right
            npc.x += npc.speed * npc.direction;

            // If the NPC reaches the edge of the screen, reverse direction
            if (npc.x <= 0 || npc.x + npc.width >= canvas.width) {
                npc.direction *= -1;  // Reverse direction
            }

            // You can add vertical movement if you want them to move up and down too
            npc.y += Math.sin(Date.now() / 1000) * 2; // Make the NPC move up and down with a sine wave
        }
    });

    // Update walking NPCs at the bottom
    walkingNPCs.forEach(npc => {
        npc.x += npc.speed;  // Move NPC to the right
        
        if (npc.x + npc.width > canvas.width) {
            npc.x = -npc.width;  // Reset position to the left once it reaches the right side
        }
    });

    // Update floating NPCs
    floatingNPCs.forEach(npc => {
        // Make the NPC float up and down with a sine wave
        npc.y += Math.sin(npc.floatTime) * 3;  // Make NPC float up and down
        npc.floatTime += 0.05;  // Increment time to vary the floating motion
    });
}

// Function to draw NPC GIFs and other NPCs
function drawNPCs() {
    npcBlocks.forEach(npc => {
        // Draw NPC GIF instead of a block
        ctx.drawImage(npcGif, npc.x, npc.y, npc.width, npc.height);  // Draw NPC GIF
    });

    // Draw walking NPCs using walking man sprite
    walkingNPCs.forEach(npc => {
        // Draw walking man sprite for each walking NPC
        ctx.drawImage(npcGif, npc.x, npc.y, npc.width, npc.height);  // Replace walkingManSprite with NPC gif
    });

    // Draw floating NPCs
    floatingNPCs.forEach(npc => {
        // Draw the "anduFace.png" image for each floating NPC
        ctx.drawImage(npcGif, npc.x, npc.y, npc.width, npc.height);
    });
}

// Example of spawning NPCs every 3 seconds
setInterval(spawnNPC, 3000); // Spawn new NPC every 3 seconds

// Function to create new walking NPCs (walking across the bottom)
function spawnWalkingNPC() {
    const npc = {
        x: Math.random() * (canvas.width - 50),  // Random X position
        y: ground.y - 50,  // Place NPC on the ground
        width: 100,
        height: 100,
        speed: 2 + Math.random() * 3,  // Random speed between 2 and 5
    };
    walkingNPCs.push(npc);
}

// Spawn walking NPCs every 10 seconds
setInterval(spawnWalkingNPC, 10000);  // Spawn new walking NPC every 5 seconds

 



// Function to spawn floating NPC when space bar is pressed
function spawnFloatingNPC() {
    const npc = {
        x: Math.random() * (canvas.width - 50),  // Random X position
        y: Math.random() * (canvas.height - 100), // Random Y position
        width: 50,
        height: 50,
        floatTime: Math.random() * 1000,  // Random time to make them float at different speeds
    };
    floatingNPCs.push(npc);
}

// Event listeners for key press and release
window.addEventListener("keydown", (e) => { 
    keys[e.code] = true; 
    if (e.code === "Space") {
        spawnFloatingNPC();  // Spawn a floating NPC when space bar is pressed
    }
});

window.addEventListener("keyup", (e) => { 
    keys[e.code] = false; 
});

function update() {
    let moving = false;

    // Move left
    if (keys["ArrowLeft"]) {
        player.x -= player.speed;
        moving = true;
    }

    // Move right
    if (keys["ArrowRight"]) {
        player.x += player.speed;
        moving = true;
    }

    // Keep player within screen boundaries
    if (player.x < 0) player.x = 0; 
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Jumping
    if (keys["ArrowUp"] && player.grounded) {
        player.velocityY = player.jumpPower;
        player.grounded = false;
    }

    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Collision with ground
    if (player.y + player.height >= ground.y) {
        player.y = ground.y - player.height;
        player.velocityY = 0;
        player.grounded = true;
    }

    // Animation logic
    if (moving) {
        player.frameCounter++;
        if (player.frameCounter % 10 < 5) {
            player.currentFrame = "walk1";
        } else {
            player.currentFrame = "walk2";
        }
    } else {
        // Alternate between idle1 and idle2
        player.frameCounter++;
        if (player.frameCounter % 30 < 30) { // Change frame every 15 frames
            player.currentFrame = "idle1";
        } else {
            player.currentFrame = "idle2";
        }
    }

    // NPC update
    updateNPCs();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
    
    // Draw player sprite
    ctx.drawImage(playerSprites[player.currentFrame], player.x, player.y, player.width, player.height);

    // Draw NPCs (GIFs and walking man sprites)
    //drawNPCs();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
