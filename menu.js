// Menu Screen: Show the Play Game button
document.getElementById("playButton").addEventListener("click", function() {
    // Hide the menu screen and show the game screen
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
    
    // Call the function to start the game
    startGame();
});
