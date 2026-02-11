const LOG_ENDPOINT = "PASTE_YOUR_SCRIPT_URL_HERE";

document.addEventListener('DOMContentLoaded', () => {
    const toInput = document.getElementById('toNameInput');
    const fromInput = document.getElementById('fromNameInput');
    const linkDisplay = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const previewBtn = document.getElementById('previewBtn');
    const toast = document.getElementById('toast');

    function updateLink() {
        const toName = toInput.value.trim();
        const fromName = fromInput.value.trim();

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
            copyBtn.disabled = false;
            previewBtn.disabled = false;
        } else {
            linkDisplay.textContent = "Fill in both names to generate link...";
            copyBtn.disabled = true;
            previewBtn.disabled = true;
        }
    }

    function logLinkAction(action) {
        if (!LOG_ENDPOINT || LOG_ENDPOINT === "PASTE_YOUR_SCRIPT_URL_HERE") return;

        const toName = toInput.value.trim();
        const fromName = fromInput.value.trim();
        const link = linkDisplay.textContent;
        const timestamp = new Date().toISOString();

        const payload = {
            toName: toName,
            fromName: fromName,
            link: link,
            timestamp: timestamp,
            action: action
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
            alert("Could not save log, link still generated");
        });
    }

    // Copy Function
    copyBtn.addEventListener('click', () => {
        const text = linkDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast();
            logLinkAction('copy');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast();
            logLinkAction('copy');
        });
    });

    // Preview Function
    previewBtn.addEventListener('click', () => {
        const url = linkDisplay.textContent;
        if (url && url.startsWith('http')) {
            window.open(url, '_blank');
            logLinkAction('preview');
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
});
