// Version: 1.3 - Youtube Next Step
window.CONFIG = {
    // Next Step URL (e.g. YouTube song)
    // If set, the video will stop looping and redirect here after 2 plays.
    youtubeNextUrl: "https://music.youtube.com/watch?v=tyKu0uZS86Q", // Example: A Thousand Years
    youtubeNextText: "A Song For You 🎵",
    // Intro Animation Settings
    intro: {
        enabled: true,
        autoStart: false,
        skipText: "Skip Intro",
        openText: "Click to open",
        // Text inside the letter
        // You can use {personName} as a placeholder
        letterText: "",
        fromName: "" // Optional signature
    },
    // The name of the person you are asking
    personName: "Ilhaam",

    // The main question
    question: "Will you be my Valentine?",

    // The title that appears on the success screen
    successTitle: "I knew you'd say YES!",

    // Paths to your media assets. 
    // Place your own files in the 'assets' folder and update the names here.
    assets: {
        // Shown on the success screen. 
        // Logic: tries to load gif, falls back to mp4, falls back to emoji.
        successGif: "https://www.pngkey.com/png/full/802-8027731_valentine-teddy-bears-png-clipart-pictureu200b-teddy-bear.png", // Reliable Bear Image
        successVideo: "assets/success-video.mp4", // Video in assets folder

        // Optional background music.
        audio: "assets/bgm.mp3"
    }
};
