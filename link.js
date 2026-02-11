const LOG_ENDPOINT = "PASTE_YOUR_WEB_APP_URL_HERE";
const LOG_SECRET = "PUT_YOUR_SECRET_HERE";

document.addEventListener('DOMContentLoaded', () => {
    const toInput = document.getElementById('toNameInput');
    const fromInput = document.getElementById('fromNameInput');
    const consentCheck = document.getElementById('consentCheck');
    const linkDisplay = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const previewBtn = document.getElementById('previewBtn');
    const toast = document.getElementById('toast');

    function updateLink() {
        const toName = toInput.value.trim();
        const fromName = fromInput.value.trim();
        const hasConsent = consentCheck.checked;

        if (toName && fromName) {
            let base = window.location.href;

            if (base.includes('link.html')) {
                base = base.replace('link.html', '');
            }
            if (!base.endsWith('/')) {
                base += '/';
            }

            const finalUrl = `${base}index.html?d=${encodeURIComponent(toName)}&f=${encodeURIComponent(fromName)}`;
            linkDisplay.textContent = finalUrl;

            // Only enable buttons If consent is checked
            if (hasConsent) {
                copyBtn.disabled = false;
                previewBtn.disabled = false;
            } else {
                copyBtn.disabled = true;
                previewBtn.disabled = true;
            }
        } else {
            linkDisplay.textContent = "Fill in both names to generate link...";
            copyBtn.disabled = true;
            previewBtn.disabled = true;
        }
    }

    function logLinkAction(action) {
        // If config is missing, just return (or log locally)
        if (!LOG_ENDPOINT || LOG_ENDPOINT.includes("PASTE_YOUR")) {
            console.log("Skipping log: No endpoint configured");
            return;
        }

        const toName = toInput.value.trim();
        const fromName = fromInput.value.trim();
        const link = linkDisplay.textContent;

        const payload = {
            secret: LOG_SECRET,
            toName: toName,
            fromName: fromName,
            link: link,
            action: action,
            userAgent: navigator.userAgent
        };

        // Use no-cors for Google Apps Script Web App
        fetch(LOG_ENDPOINT, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).then(() => {
            console.log("Logged to sheet");
        }).catch(e => {
            console.error(e);
            // Non-blocking warning
            console.warn("Could not save log, link still generated");
        });
    }

    // Copy Function
    copyBtn.addEventListener('click', () => {
        const text = linkDisplay.textContent;
        // Log first (fire and forget)
        logLinkAction('copy');

        navigator.clipboard.writeText(text).then(() => {
            showToast();
        }).catch(err => {
            console.error('Failed to copy: ', err);
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast();
        });
    });

    // Preview Function
    previewBtn.addEventListener('click', () => {
        const url = linkDisplay.textContent;
        if (url && url.startsWith('http')) {
            // Log first (fire and forget)
            logLinkAction('preview');
            window.open(url, '_blank');
        }
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Listeners
    toInput.addEventListener('input', updateLink);
    fromInput.addEventListener('input', updateLink);
    consentCheck.addEventListener('change', updateLink);
});
