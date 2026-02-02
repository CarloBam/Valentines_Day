const CONFIG = {
    // The name of the person you are asking
    personName: "Ilhaam",

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
        successGif: "https://www.pngkey.com/png/full/802-8027731_valentine-teddy-bears-png-clipart-pictureu200b-teddy-bear.png", // Reliable Bear Image
        successVideo: "", // Set to empty to skip video and go straight to image

        // Optional background music.
        audio: "assets/bgm.mp3"
    }
};
