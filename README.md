# Valentines Question App

A cute, interactive, single-page web app to ask someone to be your Valentine! It features a "Yes" button that celebrates and a "No" button that playfully runs away from the cursor.

## 🛠️ Configuration & Customization

All customization is done in `config.js`. You do not need to edit the HTML or CSS.

### 1. Change the Name
Open `config.js` and edit the `personName` value:
```javascript
const CONFIG = {
    personName: "Your Special Person",
    question: "Will you be my Valentine?",
    // ...
};
```

### 2. Add Your Own Media (Photos/Videos)
By default, the app uses placeholders. To make it special:
1.  Navigate to the `assets` folder.
2.  Drop in your cute GIF or Video file.
3.  Name them `yes.gif` or `yes.mp4` (or update the filename in `config.js`).
4.  (Optional) Add a music file named `bgm.mp3`.

If your file names are different, just update them in `config.js`:
```javascript
    assets: {
        successGif: "assets/my-cute-pic.gif",
        successVideo: "assets/our-video.mp4",
        audio: "assets/love-song.mp3"
    }
```

---

## 🚀 How to Run Locally

You don't need to install anything!

1.  Navigate to the project folder.
2.  Double-click `index.html` to open it in your browser.

OR, if you want to run it like a real web server (better for testing audio):
1.  Open VS Code or a terminal.
2.  Run a simple python server:
    ```bash
    python3 -m http.server
    ```
3.  Go to `http://localhost:8000` in your browser.

---

## 🌐 How to Deploy to GitHub Pages (Free!)

Share this with your person by putting it online for free.

1.  **Create a Repository:**
    *   Go to [GitHub.com/new](https://github.com/new).
    *   Name it `valentine-proposal` (or anything you like).
    *   Initialize with README: **No** (empty repo is easier).
    *   Click **Create repository**.

2.  **Upload Files:**
    *   In your local project folder, run these commands in your terminal:
        ```bash
        git init
        git add .
        git commit -m "Initial commit - Valentines app"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
        git push -u origin main
        ```
    *   *(Replace the URL with the one GitHub gave you)*.

3.  **Enable GitHub Pages:**
    *   Go to your repository settings on GitHub.
    *   Click **Pages** in the left sidebar.
    *   Under **Source**, select `Deploy from a branch`.
    *   Under **Branch**, select `main` and `/ (root)`.
    *   Click **Save**.

4.  **Send the Link:**
    *   Wait about 1-2 minutes.
    *   Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
    *   Send this link to your Valentine! 💘

---

## 📱 Features
*   **Responsive:** Works on Mobile and Desktop.
*   **Playful UI:** "No" button dodges the cursor.
*   **Fallback Support:** If video fails, it shows a GIF; if GIF fails, it shows a cute emoji.
*   **Audio:** Optional background music toggle.
