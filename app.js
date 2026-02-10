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
        console.log("App Initializing...");


        // 1. Check for stored name overrides
        const storedName = localStorage.getItem('valentineName');
        if (storedName) {
            config.personName = storedName;
        }

        // Set text content
        if (personNameEl) personNameEl.textContent = config.personName;
        if (questionEl) questionEl.textContent = config.question;
        if (successTitle) successTitle.textContent = config.successTitle;


        // Audio setup
        if (config.assets.audio && bgm) {
            bgm.src = config.assets.audio;
        }

        createFloatingHearts();
        setupAdmin();
    }

    // --- Interaction Logic ---

    // 1. "No" Button Dodge Logic
    let noInteractCount = 0;
    let currentScale = 1.0;

    function dodgeNo(e) {
        if (!noBtn) return;
        noBtn.style.position = 'fixed'; // Use fixed to be relative to viewport

        // Increase interaction count
        noInteractCount++;

        // Text Changes
        if (noInteractCount === 2) {
            noBtn.textContent = "Are you sure?";
        } else if (noInteractCount === 4) {
            noBtn.textContent = "Really sure?";
        } else if (noInteractCount === 6) {
            noBtn.textContent = "Just think about it";
        }

        // Hide after 15 interactions
        if (noInteractCount >= 15) {
            noBtn.style.display = 'none';
            return;
        }

        // Every 5 clicks/dodges, shrink by 10%
        if (noInteractCount % 5 === 0) {
            currentScale *= 0.9;
            noBtn.style.transform = `scale(${currentScale})`;
        }

        // Mobile-Safe Zone: Keep strictly within the middle 60% of the screen
        const safeMargin = 20; // % percentage
        const safeWidth = 60;  // % percentage used

        const randomLeft = safeMargin + Math.random() * safeWidth;
        const randomTop = safeMargin + Math.random() * safeWidth;

        noBtn.style.left = `${randomLeft}%`;
        noBtn.style.top = `${randomTop}%`;

        noBtn.classList.add('dodging');

        if (e && e.type !== 'mouseenter') {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    if (noBtn) {
        noBtn.addEventListener('mouseenter', dodgeNo);
        noBtn.addEventListener('touchstart', dodgeNo);
        noBtn.addEventListener('click', dodgeNo);
    }

    // 2. "Yes" Button Click Logic
    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            showSuccessState();
        });
    }

    // 3. State Switching
    function showSuccessState() {
        askingState.classList.add('hidden');
        successState.classList.remove('hidden');
        successState.classList.add('fade-in');

        // Stop background music so we can hear the video
        if (bgm) {
            bgm.pause();
            isPlaying = false;
        }
        if (audioToggle) audioToggle.textContent = '🎵';

        loadMedia();
    }

    // 4. Media Loading with Fallback
    function loadMedia() {
        if (!mediaPlaceholder) return;
        mediaPlaceholder.innerHTML = '';

        if (!config.assets.successVideo) {
            loadGif();
            return;
        }

        let videoSrc = config.assets.successVideo;

        console.log(`Loading video from: ${videoSrc}`);

        // Create video element safely
        const video = document.createElement('video');
        video.id = 'successVideoElement';
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.muted = false; // Try sound first
        video.style.cssText = "width: 100%; border-radius: 12px; background: #000; min-height: 200px; display:block;";

        const source = document.createElement('source');
        source.src = videoSrc;
        source.type = 'video/mp4'; // Explicitly set type

        source.onerror = (e) => {
            console.log("Source failed to load.");
        };

        video.appendChild(source);

        const fallbackText = document.createElement('p');
        fallbackText.textContent = "Your browser does not support the video tag.";
        video.appendChild(fallbackText);

        mediaPlaceholder.appendChild(video);
        console.log("Video element appended.");

        // Handle loading errors
        video.onerror = (e) => {
            let errorMsg = "Unknown Error";
            if (video.error) {
                switch (video.error.code) {
                    case 1: errorMsg = "MEDIA_ERR_ABORTED"; break;
                    case 2: errorMsg = "MEDIA_ERR_NETWORK"; break;
                    case 3: errorMsg = "MEDIA_ERR_DECODE"; break;
                    case 4: errorMsg = "MEDIA_ERR_SRC_NOT_SUPPORTED"; break;
                    default: errorMsg = "Code " + video.error.code;
                }
            }
            console.error(`Video Error: ${errorMsg}`);
            console.log("Trying GIF fallback...");
            loadGif();
        };

        // Try to play with sound first
        video.muted = false;
        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log("Video playing with sound.");
                })
                .catch(error => {
                    console.error(`Autoplay (sound) failed: ${error.name}`);
                    // Fallback: Mute and play 
                    video.muted = true;
                    video.play()
                        .then(() => {
                            console.log("Autoplay (muted) success.");
                            // Show "Tap to Unmute" button
                            showUnmuteButton(video);
                        })
                        .catch(e => console.error(`Autoplay (muted) failed.`));
                });
        }
    }

    function showUnmuteButton(video) {
        const btn = document.createElement('button');
        btn.textContent = "🔇 Tap to Unmute";
        btn.style.cssText = "position:absolute; bottom:20px; left:50%; transform:translateX(-50%); z-index:10; background:rgba(0,0,0,0.7); color:white; border:none; padding:10px 20px; border-radius:20px; font-weight:bold; cursor:pointer;";

        // Ensure parent is relative for scaling
        mediaPlaceholder.style.position = 'relative';
        mediaPlaceholder.appendChild(btn);

        btn.addEventListener('click', () => {
            video.muted = false;
            btn.remove();
        });

        // Also remove if user uses native controls
        video.addEventListener('volumechange', () => {
            if (!video.muted) btn.remove();
        });
    }

    // Auto-play BGM on first user interaction
    document.body.addEventListener('click', function startAudio() {
        if (config.assets.audio && bgm && bgm.paused && audioToggle.textContent === '🎵') {
            // Only auto-play if we are NOT in success state (where we want video audio)
            if (successState.classList.contains('hidden')) {
                bgm.play().catch(e => console.log("BGM Auto-play failed", e));
                isPlaying = true;
                audioToggle.textContent = '🔇';
            }
        }
        // Remove listener after first interaction
        document.body.removeEventListener('click', startAudio);
    }, { once: true });

    function loadGif() {
        if (!mediaPlaceholder) return;
        mediaPlaceholder.innerHTML = '';

        const img = document.createElement('img');
        img.src = config.assets.successGif;
        img.alt = "Celebration";
        img.className = 'media-asset';
        img.onerror = () => {
            console.log("GIF failed, showing emoji");
            mediaPlaceholder.innerHTML = '<div class="cute-emoji-success">💖🥰💖</div>';
        };
        mediaPlaceholder.appendChild(img);
    }

    // 5. Audio Toggle
    let isPlaying = false;
    if (audioToggle && bgm) {
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
    }

    // 6. Background Decorations
    function createFloatingHearts() {
        const container = document.getElementById('heartsContainer');
        if (!container) return;

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
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            successState.classList.add('hidden');
            successState.classList.remove('fade-in');
            askingState.classList.remove('hidden');

            // Reset No Button
            noInteractCount = 0;
            currentScale = 1.0;
            if (noBtn) {
                noBtn.style.position = 'static';
                noBtn.style.transform = 'scale(1)';
                noBtn.style.display = 'inline-block'; // Or block/initial based on CSS, usually inline-block for buttons
                noBtn.textContent = 'No';
                noBtn.classList.remove('dodging');
            }
        });
    }

    // 8. Admin / Settings Logic
    function setupAdmin() {
        const adminBtn = document.getElementById('adminBtn');
        const adminModal = document.getElementById('adminModal');
        const closeModal = document.getElementById('closeModal');
        const saveNameBtn = document.getElementById('saveNameBtn');
        const newNameInput = document.getElementById('newNameInput');

        if (!adminBtn || !adminModal) return;

        adminBtn.addEventListener('click', () => {
            const password = prompt("Enter Admin Password:");
            if (password === "iloveyou" || password === "admin") {
                adminModal.classList.remove('hidden');
                if (newNameInput) newNameInput.value = config.personName;
            } else {
                alert("Incorrect password!");
            }
        });

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                adminModal.classList.add('hidden');
            });
        }

        if (saveNameBtn) {
            saveNameBtn.addEventListener('click', () => {
                const newName = newNameInput.value.trim();
                if (newName) {
                    localStorage.setItem('valentineName', newName);
                    config.personName = newName;
                    if (personNameEl) personNameEl.textContent = newName;
                    alert("Name updated! (Saved in your browser)");
                    adminModal.classList.add('hidden');
                }
            });
        }
    }

    // Run init
    try {
        init();
    } catch (e) {
        console.error(e);
        alert("Init failed: " + e.message);
    }
});
