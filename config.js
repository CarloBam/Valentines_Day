const CONFIG = {
    // The name of the person you are asking
    personName: "Crush",

    // The main question
    question: "Will you be my Valentine?",

    // The title that appears on the success screen
    successTitle: "Yay! I knew you'd say YES!",

    // A sweet message that appears below the success title
    successMessage: "I owe you snacks and a cute date! ❤️",

    // Paths to your media assets. 
    // Place your own files in the 'assets' folder and update the names here.
    assets: {
        // Shown on the success screen. 
        // Logic: tries to load gif, falls back to mp4, falls back to emoji.
        successGif: "https://media1.tenor.com/m/K24jH77FvD8AAAAC/mochi-peach-cat-mochi-cat.gif", // Cute Mochi Cat love
        successVideo: "", // Set to empty to skip video and go straight to GIF

        // Optional background music.
        audio: "assets/bgm.mp3"
    }
};
