# XShot 📸

![XShot Logo](/images/icon256.png)

Create perfect, clean, and customizable snapshots of X(Twitter) posts in one click.

## Motivation

Sharing X(tweeter) post on other platforms like Instagram, LinkedIn, or in news articles is a common practice. However, simply taking a screenshot often results in a low-quality, cluttered, and poorly-sized image. It includes unnecessary UI elements, uses relative timestamps (e.g., "1h ago"), and doesn't adapt well to different platform dimensions.

XShot was built to solve these problems by providing a seamless, one-click tool to generate beautiful and professional-looking tweet snapshots right from your browser.

## The Problem and The Solution

### The Problem 😠

- **Awkward Dimensions:** A standard screenshot of a tweet looks terrible in an Instagram Story or a square post.
- **Imprecise Timestamps:** "2h ago" is useless for archival or news purposes. You need the exact date and time.
- **UI Clutter:** Screenshots capture likes, replies, subscribe buttons, and other distracting UI elements.
- **Inconsistent Themes:** The screenshot theme might not match the content you're creating.

### The Solution: XShot ✨

XShot is a browser extension that integrates directly into the X/Twitter UI.

- **One-Click Capture:** A "Create Snapshot" button is added directly to each tweet's "More" (...) menu.
- **Powerful Editor:** Clicking the button opens a local editor tab where you can customize the snapshot.
- **Perfect Dimensions:** Choose from presets for different platforms like Instagram Post (1:1), Instagram Story (9:16), or YouTube Thumbnail (16:9). The aspect ratio is always maintained perfectly without distortion.
- **Clean & Accurate:** The snapshot only includes the essential parts of the tweet—name, handle, text, media, and the **exact timestamp**. No clutter.
- **Light, Dim & Dark Themes:** Choose the theme that best fits your brand or content.

## How to Install

Since this extension is not yet on the Chrome Web Store, you can load it directly in any Chromium-based browser (Chrome, Edge, Brave, Opera) or Firefox.

#### 1: Get the Code

Download this project's code as a ZIP file and unzip it, or clone the repository using Git. You should have a folder named `XShot` on your computer.

#### 2: Open Browser Extensions Page

In your browser, navigate to the extensions management page:

- **Chrome/Edge/Brave:** `chrome://extensions`
- **Firefox:** `about:debugging#/runtime/this-firefox`

#### 3: Enable Developer Mode & Load the Extension

1. Find the **"Developer mode"** toggle and turn it on. This is usually in the top-right corner of the page.

2. Click the **"Load unpacked"** button.

![Enable Developer Mode & Load the Extension](/assets/1.png)

#### 4: Select the Extension

Navigate to and select the `XShot` folder on your computer.

![Select the Extension](/assets/2.png)

#### 5: Ready to Go!

The XShot extension should now appear in your list of extensions, and you'll see its icon in your browser's toolbar.

![Ready to Go!](/assets/3.png)

#### 6: Demo

Go to `x.com`, and you're ready to start creating snapshots!

![Demo](/assets/demo.gif)

## How to Contribute

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

You can contribute in several ways:

- **🐛 Reporting Bugs:** If you find a bug, please [open an issue](https://github.com/Sagar-v4/XShot/issues) and describe the problem in as much detail as possible.
- **💡 Suggesting Enhancements:** Have an idea to make XShot better? Open an issue to discuss your suggestion.
- **📝 Writing Code:** If you want to fix a bug or add a new feature, follow these steps:

### The Git Workflow

1.  **Fork the Project:** Click the 'Fork' button at the top right of the repository page.
2.  **Create your Feature Branch:**
    ```sh
    git checkout -b feature/AmazingNewFeature
    ```
3.  **Commit your Changes:**
    ```sh
    git commit -m 'Add some AmazingNewFeature'
    ```
4.  **Push to the Branch:**
    ```sh
    git push origin feature/AmazingNewFeature
    ```
5.  **Open a Pull Request:** Go back to your forked repository on GitHub and click the "New pull request" button.

Thank you for helping make XShot better!
