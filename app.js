
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
        // 1. Check for stored name overrides
        const storedName = localStorage.getItem('valentineName');
        if (storedName) {
            config.personName = storedName;
        }

        // Set text content
        personNameEl.textContent = config.personName;
        questionEl.textContent = config.question;
        successTitle.textContent = config.successTitle;
        successMessage.textContent = config.successMessage;

        // Audio setup
        if (config.assets.audio) {
            bgm.src = config.assets.audio;
        }

        createFloatingHearts();
        setupAdmin();
    }

    // --- Interaction Logic ---

    // 1. "No" Button Dodge Logic
    function dodgeNo(e) {
        noBtn.style.position = 'fixed'; // Use fixed to be relative to viewport

        // Mobile-Safe Zone: Keep strictly within the middle 60% of the screen
        // This avoids address bars (top/bottom) and edge swipes
        const safeMargin = 20; // % percentage
        const safeWidth = 60;  // % percentage used

        // Random percent between 20% and 80%
        const randomLeft = safeMargin + Math.random() * safeWidth;
        const randomTop = safeMargin + Math.random() * safeWidth;

        noBtn.style.left = `${randomLeft}%`;
        noBtn.style.top = `${randomTop}%`;

        noBtn.classList.add('dodging');

        // Prevent default click logic
        if (e && e.type !== 'mouseenter') {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    // Add multiple event listeners for robust dodging
    noBtn.addEventListener('mouseenter', dodgeNo);
    noBtn.addEventListener('touchstart', dodgeNo);
    noBtn.addEventListener('click', dodgeNo);

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
        mediaPlaceholder.innerHTML = '';

        if (!config.assets.successVideo) {
            loadGif();
            return;
        }

        const video = document.createElement('video');
        video.src = config.assets.successVideo;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.muted = true;
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
            mediaPlaceholder.innerHTML = '<div class="cute-emoji-success">💖🥰💖</div>';
        };
        mediaPlaceholder.innerHTML = '';
        mediaPlaceholder.appendChild(img);
    }

    // 5. Audio Toggle
    let isPlaying = false;
    audioToggle.addEventListener('click', () => {
        if (!isPlaying) {
            bgm.play().then(() => {
                isPlaying = true;
                audioToggle.textContent = '🔇';
            }).catch(e => console.log(e));
        } else {
            bgm.pause();
            isPlaying = false;
            audioToggle.textContent = '🎵';
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
        noBtn.style.position = 'static';
        noBtn.classList.remove('dodging');
    });

    // 8. Admin / Settings Logic
    function setupAdmin() {
        const adminBtn = document.getElementById('adminBtn');
        const adminModal = document.getElementById('adminModal');
        const closeModal = document.getElementById('closeModal');
        const saveNameBtn = document.getElementById('saveNameBtn');
        const newNameInput = document.getElementById('newNameInput');

        adminBtn.addEventListener('click', () => {
            const password = prompt("Enter Admin Password:");
            if (password === "iloveyou" || password === "admin") { // Simple client-side check
                adminModal.classList.remove('hidden');
                newNameInput.value = config.personName;
            } else {
                alert("Incorrect password!");
            }
        });

        closeModal.addEventListener('click', () => {
            adminModal.classList.add('hidden');
        });

        saveNameBtn.addEventListener('click', () => {
            const newName = newNameInput.value.trim();
            if (newName) {
                localStorage.setItem('valentineName', newName); // Save to browser storage
                config.personName = newName;
                personNameEl.textContent = newName;
                alert("Name updated! (Saved in your browser)");
                adminModal.classList.add('hidden');
            }
        });
    }

    // Run init
    init();
});
