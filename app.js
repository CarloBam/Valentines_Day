
// Access config from the global window object (defined in config.js)
const config = window.CONFIG;

// Validates that DOM elements exist before interacting with them
document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const personNameEl = document.getElementById('personName');
    const questionEl = document.getElementById('questionText');
    const askingState = document.getElementById('askingState');
    const successState = document.getElementById('successState');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const successTitle = document.getElementById('successTitle');
    const successMessage = document.getElementById('successMessage');
    const mediaPlaceholder = document.getElementById('mediaPlaceholder');
    const audioToggle = document.getElementById('audioToggle');
    const bgm = document.getElementById('bgm');
    const replayBtn = document.getElementById('replayBtn');

    // --- Initialization ---
    function init() {
        // Set text content from config
        personNameEl.textContent = config.personName;
        questionEl.textContent = config.question;
        successTitle.textContent = config.successTitle;
        successMessage.textContent = config.successMessage;

        // Audio setup
        if (config.assets.audio) {
            bgm.src = config.assets.audio;
        }

        createFloatingHearts();
    }

    // --- Interaction Logic ---

    // 1. "No" Button Dodge Logic
    function dodgeNo(e) {
        // Ensure the button acts as fixed position to move freely
        noBtn.style.position = 'fixed';

        const btnWidth = noBtn.offsetWidth;
        const btnHeight = noBtn.offsetHeight;

        // Use a larger padding to ensure it stays well inside
        const padding = 80;

        // Get valid window dimensions
        const maxX = window.innerWidth - btnWidth - padding;
        const maxY = window.innerHeight - btnHeight - padding;
        const minX = padding;
        const minY = padding;

        // Ensure we have a valid range (in case screen is tiny)
        const safeMaxX = Math.max(minX, maxX);
        const safeMaxY = Math.max(minY, maxY);

        // Generate random coordinates
        let newX = Math.random() * (safeMaxX - minX) + minX;
        let newY = Math.random() * (safeMaxY - minY) + minY;

        // Apply new position
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;

        // Add wiggle class for effect
        noBtn.classList.add('dodging');

        // Prevent default click behavior if this was triggered by a click/tap
        if (e && e.type !== 'mouseenter') {
            e.preventDefault();
        }
    }

    // Add multiple event listeners for robust dodging
    noBtn.addEventListener('mouseenter', dodgeNo);
    noBtn.addEventListener('touchstart', dodgeNo); // Mobile touch
    noBtn.addEventListener('click', dodgeNo); // Fallback

    // 2. "Yes" Button Click Logic
    yesBtn.addEventListener('click', () => {
        showSuccessState();
        playCelebrate();
    });

    // 3. State Switching
    function showSuccessState() {
        askingState.classList.add('hidden');
        successState.classList.remove('hidden');
        successState.classList.add('fade-in');

        loadMedia();
    }

    // 4. Media Loading with Fallback
    function loadMedia() {
        mediaPlaceholder.innerHTML = ''; // Clear emoji placeholder

        // If no video is defined, go straight to GIF
        if (!config.assets.successVideo) {
            loadGif();
            return;
        }

        const video = document.createElement('video');
        video.src = config.assets.successVideo;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.muted = true; // Auto-play often requires muted first
        video.className = 'media-asset';

        video.onerror = () => {
            console.log("Video failed to load, trying GIF...");
            loadGif();
        };

        mediaPlaceholder.appendChild(video);
    }

    function loadGif() {
        const img = document.createElement('img');
        img.src = config.assets.successGif;
        img.alt = "Celebration";
        img.className = 'media-asset';
        img.onerror = () => {
            console.log("GIF failed to load, falling back to emoji.");
            mediaPlaceholder.innerHTML = '<div class="cute-emoji-success">💖🥰💖</div>';
        };
        // Clear container just in case (e.g. removing failed video)
        mediaPlaceholder.innerHTML = '';
        mediaPlaceholder.appendChild(img);
    }

    // 5. Audio Toggle
    let isPlaying = false;
    audioToggle.addEventListener('click', () => {
        if (!isPlaying) {
            bgm.play().then(() => {
                isPlaying = true;
                audioToggle.textContent = '🔇'; // State: Playing, click to mute
            }).catch(e => {
                console.log("Audio play failed (interaction required first?):", e);
            });
        } else {
            bgm.pause();
            isPlaying = false;
            audioToggle.textContent = '🎵'; // State: Muted, click to play
        }
    });

    // 6. Background Decorations
    function createFloatingHearts() {
        const container = document.getElementById('heartsContainer');
        const heartCount = 15;

        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart-particle');
            heart.textContent = ['❤️', '💖', '💕', '💗'][Math.floor(Math.random() * 4)];

            // Randomize position and animation delay
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDelay = Math.random() * 5 + 's';
            heart.style.fontSize = (Math.random() * 1 + 1) + 'rem';

            container.appendChild(heart);
        }
    }

    // 7. Replay
    replayBtn.addEventListener('click', () => {
        successState.classList.add('hidden');
        askingState.classList.remove('hidden');
        // Reset No button position
        noBtn.style.position = 'static';
        noBtn.classList.remove('dodging');
    });

    // Run init
    init();
});
