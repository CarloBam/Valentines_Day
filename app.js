// Access config from the global window object (defined in config.js)
const config = window.CONFIG;

// Validates that DOM elements exist before interacting with them
document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const personNameEl = document.getElementById('personName');
    const questionEl = document.getElementById('questionText');
    const askingState = document.getElementById('askingState');
    const successState = document.getElementById('successState');
    const nextState = document.getElementById('nextState'); // New Screen
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const successTitle = document.getElementById('successTitle');
    const mediaPlaceholder = document.getElementById('mediaPlaceholder');

    const bgm = document.getElementById('bgm');
    const replayBtn = document.getElementById('replayBtn');
    const youtubeNextLink = document.getElementById('youtubeNextLink'); // New Link
    const backToSuccessBtn = document.getElementById('backToSuccessBtn'); // New Link

    // Final Card Elements
    const finalCardState = document.getElementById('finalCardState');
    const finalCardIntro = document.getElementById('finalCardIntro');
    const finalCardTo = document.getElementById('finalCardTo');
    const finalCardFrom = document.getElementById('finalCardFrom');
    const finalCardDate = document.getElementById('finalCardDate');
    const finalCardNote = document.getElementById('finalCardNote');
    const finalBackBtn = document.getElementById('finalBackBtn');
    const saveCardBtn = document.getElementById('saveCardBtn');

    let isPlaying = false;
    let senderName = "";
    let hasBothNames = false;



    // --- Initialization ---
    function init() {
        console.log("App Initializing...");

        // 1. Check for URL params or stored name overrides
        const params = new URLSearchParams(window.location.search);
        const urlName = (params.get("d") || "").trim();
        const urlFrom = (params.get("f") || "").trim();

        if (urlFrom) {
            senderName = urlFrom;
        }

        if (urlName) {
            config.personName = urlName;
        } else {
            const storedName = localStorage.getItem('valentineName');
            if (storedName) {
                config.personName = storedName;
            }
        }

        hasBothNames = Boolean(urlName && urlFrom);

        // 2. Check for "Returned from YouTube" flag
        // We do this via the visibilitychange listener globally, 
        // but we also check on load just in case (though visibilitychange is safer for tab switching)
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible" && sessionStorage.getItem("wentToYoutube") === "1") {
                sessionStorage.removeItem("wentToYoutube");

                if (!hasBothNames) return; // Only show final card if BOTH names exist

                populateFinalCard();
                showFinalCard();
            }
        });

        // Set text content
        if (personNameEl) personNameEl.textContent = config.personName;
        if (questionEl) questionEl.textContent = config.question;
        if (successTitle) successTitle.textContent = config.successTitle;

        // Configure Youtube Link if present
        if (config.youtubeNextUrl && youtubeNextLink) {
            youtubeNextLink.href = config.youtubeNextUrl;
            if (config.youtubeNextText) youtubeNextLink.textContent = config.youtubeNextText;

            // Track click
            youtubeNextLink.addEventListener("click", () => {
                sessionStorage.setItem("wentToYoutube", "1");
            });
        }

        // Audio setup
        if (config.assets.audio && bgm) {
            bgm.src = config.assets.audio;
        }

        createFloatingHearts();
        setupAdmin();

        // Start Intro or Skip
        if (config.intro && config.intro.enabled) {
            setupIntro();
        } else {
            startMainApp();
        }
    }

    // --- Intro Animation Logic ---
    function setupIntro() {
        // Set Text

        if (openText) openText.textContent = config.intro.openText || "Open Me";

        if (letterContent) {
            letterContent.innerHTML = `
                <h2 class="mini-headline">Hey ${config.personName}...</h2>
                <div class="mini-emoji">🥺👉👈</div>
                <p class="mini-text">Will you be my Valentine?</p>
            `;
        }

        // Event Listeners


        if (envelopeWrapper) {
            const openEnvelope = () => {
                const envelope = envelopeWrapper.querySelector('.envelope');
                const letter = envelope.querySelector('.letter');

                if (envelope.classList.contains('open')) return; // Already open

                envelope.classList.add('open');

                // Hide open text
                if (openText) openText.style.opacity = '0';


                // Sequence: 
                // 1. Open Flap & Letter Pop Up (0.8s)
                setTimeout(() => {
                    // 2. Detach Letter & Drop Envelope
                    // We lock the letter to the center of the screen so it stays static
                    // while the envelope falls away.

                    // Get current metrics to avoid jump?
                    // actually, calculating exact center is easier:
                    // The animation Step 1 puts it roughly at center.
                    // We switch to fixed positioning now.

                    letter.style.position = 'fixed';
                    letter.style.top = '50%';
                    letter.style.left = '50%';
                    letter.style.transform = 'translate(-50%, -50%)';
                    letter.style.zIndex = '2000';
                    letter.style.margin = '0';

                    // Trigger Drop
                    envelope.classList.add('slide-out');

                    // 3. Expand Letter (Gradual & Cute)
                    setTimeout(() => {
                        envelope.classList.add('zoom-in');
                        // Note: CSS handles the width/height transition for .zoom-in .letter
                        // forcing it to match card size

                        // 4. Reveal Main App Crossfade
                        setTimeout(() => {
                            startMainApp();
                        }, 1200);

                    }, 500); // Small pause before expanding

                }, 800);
            };

            envelopeWrapper.addEventListener('click', openEnvelope);

            // Auto open after 10 seconds if not clicked
            setTimeout(() => {
                const envelope = envelopeWrapper.querySelector('.envelope');
                if (envelope && !envelope.classList.contains('open') && introScreen && !introScreen.classList.contains('hidden')) {
                    openEnvelope();
                }
            }, 10000);
        }
    }

    function startMainApp() {
        if (mainScreen) {
            mainScreen.classList.remove('hidden');
            // Trigger reflow?
            void mainScreen.offsetWidth;
            mainScreen.classList.add('visible'); // Fade in
        }

        if (introScreen) {
            // Fade out intro screen content (envelope etc is already gone/hidden by expansion)
            // We want the Expanded Letter (which is part of introScreen) to fade out
            // AS the Main Card fades in.
            introScreen.style.transition = 'opacity 1s ease';
            introScreen.style.opacity = '0';

            setTimeout(() => {
                introScreen.style.display = 'none';
            }, 1000);
        }
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
        if (noInteractCount === 3) {
            noBtn.textContent = "Are you sure?";
        } else if (noInteractCount === 4) {
            noBtn.textContent = "Really sure?";
        } else if (noInteractCount === 5) {
            noBtn.textContent = "Okay, pause. Think again";
        } else if (noInteractCount === 6) {
            noBtn.textContent = "I will simply move over here";
        } else if (noInteractCount === 7) {
            noBtn.textContent = "What if I say please?";
        } else if (noInteractCount === 8) {
            noBtn.textContent = "The yes button is right there.";
        } else if (noInteractCount === 9) {
            noBtn.textContent = "Yes is the only option.";
        }

        // Hide after 15 interactions
        if (noInteractCount >= 10) {
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
        video.playsInline = true;
        video.muted = false; // Try sound first
        video.style.cssText = "width: 100%; border-radius: 12px; background: #000; min-height: 200px; display:block;";

        // Check if we have a next step configured
        const hasNextStep = !!config.youtubeNextUrl;
        let loopCount = 0;
        const maxLoops = 2;

        if (hasNextStep) {
            video.loop = false; // We handle "looping" manually

            video.addEventListener('ended', () => {
                loopCount++;
                console.log(`Video ended. Play count: ${loopCount}`);

                if (loopCount < maxLoops) {
                    // Replay
                    video.play().catch(e => console.log("Replay failed", e));
                } else {
                    // STOP and Go to Next Screen
                    console.log("Max loops reached. Proceeding to next step.");
                    successState.classList.add('hidden');
                    if (nextState) {
                        nextState.classList.remove('hidden');
                        nextState.classList.add('fade-in');
                    }
                    // Stop background music if it was playing
                    if (bgm) {
                        bgm.pause();
                        isPlaying = false;
                    }

                }
            });
        } else {
            video.loop = true; // Infinite loop if no next step
        }

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
                    default: errorMsg = `Code ${video.error.code}`;
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
        if (config.assets.audio && bgm && bgm.paused) {
            // Only auto-play if we are NOT in success state (where we want video audio)
            if (successState.classList.contains('hidden')) {
                bgm.play().catch(e => console.log("BGM Auto-play failed", e));
                isPlaying = true;
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

    // 8. Back Button (from Next Step)
    if (backToSuccessBtn) {
        backToSuccessBtn.addEventListener('click', () => {
            if (nextState) {
                nextState.classList.add('hidden');
                nextState.classList.remove('fade-in');
            }
            if (successState) {
                successState.classList.remove('hidden');
                successState.classList.add('fade-in');
                // Optional: Restart video or just let it sit there? 
                // Given standard behavior, we just show the previous screen.
            }
        });
    }

    // 9. Admin / Settings Logic
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

    // 10. Final Card Logic
    function populateFinalCard() {
        if (finalCardIntro) finalCardIntro.textContent = config.finalCardIntro || "Thank you for choosing yes";
        if (finalCardTo) finalCardTo.textContent = `To ${config.personName}`;
        if (finalCardNote) finalCardNote.textContent = (config.finalCardNote || "Hope this made you smile.") + " 🙂";

        if (finalCardFrom) {
            finalCardFrom.textContent = `From ${senderName}`;
        }

        if (finalCardDate) {
            const today = new Date();
            const options = { day: 'numeric', month: 'short', year: 'numeric' }; // e.g., 11 Feb 2026
            finalCardDate.textContent = today.toLocaleDateString('en-GB', options);
        }
    }

    function showFinalCard() {
        // Hide all others
        if (introScreen) introScreen.style.display = 'none'; // Ensure intro is gone
        if (askingState) askingState.classList.add('hidden');
        if (successState) successState.classList.add('hidden');
        if (nextState) nextState.classList.add('hidden');

        if (finalCardState) {
            finalCardState.classList.remove('hidden');
            finalCardState.classList.add('fade-in');
        }

        // Stop music if playing
        if (bgm && !bgm.paused) {
            bgm.pause();
            isPlaying = false;
        }
    }

    // ... (rest of code)

    if (finalBackBtn) {
        finalBackBtn.addEventListener('click', () => {
            if (finalCardState) {
                finalCardState.classList.add('hidden');
                finalCardState.classList.remove('fade-in');
            }
            // Go back to next state usually
            if (nextState) {
                nextState.classList.remove('hidden');
                nextState.classList.add('fade-in');
            }
        });
    }

    // 11. Save Card Functionality
    if (saveCardBtn) {
        saveCardBtn.addEventListener('click', () => {
            exportFinalCardAsPng();
        });
    }

    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', () => {
            exportWhatsAppStatus();
        });
    }

    function exportFinalCardAsPng() {
        const cardElement = document.getElementById('finalCard');
        if (!cardElement) return;

        const originalText = saveCardBtn.textContent;
        saveCardBtn.textContent = "Saving...";

        // Use html2canvas
        html2canvas(cardElement, {
            scale: 2, // Retinas display quality
            backgroundColor: null, // Transparent bg if possible, or white by default
            useCORS: true // Allow cross-origin images if any
        }).then(canvas => {
            downloadCanvas(canvas, 'valentine-card');
            saveCardBtn.textContent = originalText;
        }).catch(err => {
            console.error("Save failed:", err);
            alert("Oops! Could not save image.");
            saveCardBtn.textContent = originalText;
        });
    }

    function exportWhatsAppStatus() {
        const cardElement = document.getElementById('finalCard');
        if (!cardElement) return;

        const originalText = saveStatusBtn.textContent;
        saveStatusBtn.textContent = "Generating...";

        // 1. Create a 1080x1920 wrapper offscreen
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: fixed; 
            top: 0; left: -9999px; 
            width: 1080px; height: 1920px; 
            background: #fff0f3;
            background-image: radial-gradient(#ffccd5 2px, transparent 2px);
            background-size: 30px 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(wrapper);

        // 2. Clone the card and scale it up a bit for the story format
        const clone = cardElement.cloneNode(true);
        // Reset margins / widths for the centered layout
        clone.style.margin = '0';
        clone.style.maxWidth = '800px';
        clone.style.width = '80%';
        clone.style.transform = 'scale(1.5)'; // Make it big and readable

        // Add some branding or decoration bottom (optional)
        const branding = document.createElement('div');
        branding.textContent = "Made with ❤️";
        branding.style.cssText = "position: absolute; bottom: 100px; color: #ff8fa3; font-family: 'Outfit', sans-serif; font-size: 2rem;";

        wrapper.appendChild(clone);
        wrapper.appendChild(branding);

        // 3. Capture
        html2canvas(wrapper, {
            scale: 1, // 1:1 since we set exact pixels
            backgroundColor: null,
            useCORS: true
        }).then(canvas => {
            downloadCanvas(canvas, 'valentine-status');

            // Cleanup
            document.body.removeChild(wrapper);
            saveStatusBtn.textContent = originalText;
        }).catch(err => {
            console.error("Status export failed:", err);
            alert("Oops! Could not generate status image.");
            document.body.removeChild(wrapper);
            saveStatusBtn.textContent = originalText;
        });
    }

    function downloadCanvas(canvas, prefix) {
        const link = document.createElement('a');
        const safeTo = (config.personName || "Valentine").replace(/[^a-z0-9]/gi, '_');
        const safeFrom = (senderName || "Me").replace(/[^a-z0-9]/gi, '_');
        const filename = `${prefix}-${safeTo}-${safeFrom}.png`;

        link.download = filename;
        link.href = canvas.toDataURL("image/png");

        // Try download
        try {
            link.click();
        } catch (e) {
            console.log("Download failed, opening in new tab");
            window.open(link.href, '_blank');
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
