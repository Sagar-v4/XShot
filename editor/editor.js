document.addEventListener("DOMContentLoaded", () => {
  // --- Element References ---
  const snapshotContainer = document.getElementById("snapshot-container");
  const snapshotFooter = document.getElementById("snapshot-footer");
  const nameEl = document.getElementById("name");
  const handleEl = document.getElementById("handle");
  const pfpEl = document.getElementById("pfp");
  const mainContentContainer = document.getElementById(
    "main-content-container"
  );

  // Quoted tweet elements
  const quoteContainerEl = document.getElementById("quoted-tweet-container");
  const qNameEl = document.getElementById("q-name");
  const qHandleEl = document.getElementById("q-handle");
  const qTextEl = document.getElementById("q-text");
  const qPfpEl = document.getElementById("q-pfp");
  const qTimestamp = document.getElementById("q-timestamp");

  const pollContainer = document.getElementById("poll-container");
  const mediaContainer = document.getElementById("media-container");
  const quotedPostContainer = document.getElementById("quoted-post-container");
  const timestampContainer = document.getElementById("timestamp-container");
  const themeSelect = document.getElementById("theme-select");
  const dimensionSelect = document.getElementById("dimension-select");
  const fontSizeInput = document.getElementById("font-size-input");
  const textOnlyCheckbox = document.getElementById("text-only-checkbox");
  const hideDateTimeCheckbox = document.getElementById(
    "hide-date-time-checkbox"
  );
  const downloadBtn = document.getElementById("download-btn");

  // --- Event Listeners ---
  themeSelect.addEventListener("change", (e) => {
    snapshotContainer.classList.remove(
      "theme-light",
      "theme-dim",
      "theme-dark"
    );
    snapshotContainer.classList.add(e.target.value);
  });

  // Re-render when the "Text Only" checkbox is changed
  textOnlyCheckbox.addEventListener("change", (e) => {
    const shouldHide = e.target.checked;

    if (mediaContainer.innerHTML) {
      mediaContainer.style.display = shouldHide ? "none" : "grid";
    }
    if (pollContainer.innerHTML) {
      pollContainer.style.display = shouldHide ? "none" : "block";
    }
    if (quotedPostContainer) {
      quotedPostContainer.style.display = shouldHide ? "none" : "block";
    }
  });

  // Re-render when the "Hide Date and Time" checkbox is changed
  hideDateTimeCheckbox.addEventListener("change", (e) => {
    const shouldHide = e.target.checked;

    if (timestampContainer.innerHTML) {
      timestampContainer.style.display = shouldHide ? "none" : "block";
    }
    if (snapshotFooter.innerHTML) {
      snapshotFooter.style.display = shouldHide ? "none" : "block";
    }
  });

  dimensionSelect.addEventListener("change", (e) => {
    snapshotContainer.classList.remove("fixed-dimension");
    snapshotContainer.style.width = "540px";
    snapshotContainer.style.height = "auto";
    const value = e.target.value;
    if (value === "square") {
      snapshotContainer.classList.add("fixed-dimension");
      snapshotContainer.style.width = "540px";
      snapshotContainer.style.height = "540px";
    } else if (value === "portrait") {
      snapshotContainer.classList.add("fixed-dimension");
      snapshotContainer.style.width = "540px";
      snapshotContainer.style.height = "960px";
    } else if (value === "landscape") {
      snapshotContainer.classList.add("fixed-dimension");
      snapshotContainer.style.width = "640px";
      snapshotContainer.style.height = "360px";
    }
  });

  fontSizeInput.addEventListener("input", (e) => {
    mainContentContainer.style.fontSize = `${e.target.value}px`;
  });

  textOnlyCheckbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      snapshotContainer.classList.add("text-only-mode");
    } else {
      snapshotContainer.classList.remove("text-only-mode");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const emojiImages = mainContentContainer.querySelectorAll(
      'img[src*="abs-0.twimg.com/emoji"]'
    );
    emojiImages.forEach((img) => {
      const altText = img.getAttribute("alt");
      if (altText) {
        const textNode = document.createTextNode(altText);
        img.parentNode.replaceChild(textNode, img);
      }
    });

    html2canvas(snapshotContainer, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `XShot_${handleEl.innerText.replace(
        "@",
        ""
      )}_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      chrome.storage.local.get("lastScrapedData", (result) => {
        if (result.lastScrapedData) {
          mainContentContainer.innerHTML =
            result.lastScrapedData.mainContentHTML;
        }
      });
    });
  });

  // --- Initial Load ---
  chrome.storage.local.get("dataForSnapshot", (result) => {
    const data = result.dataForSnapshot;
    if (data) {
      chrome.storage.local.set({ lastScrapedData: data });
      nameEl.innerText = data.name;
      handleEl.innerText = data.handle;
      pfpEl.src = data.pfpUrl;
      mainContentContainer.innerHTML = data.mainContentHTML;
      timestampContainer.innerHTML = data.timestamp;

      if (data.pollHTML) {
        pollContainer.innerHTML = data.pollHTML;
        pollContainer.style.display = "block";
      } else {
        pollContainer.innerHTML = null;
        pollContainer.style.display = "none";
      }

      if (data.quotedTweet) {
        qNameEl.innerText = data.quotedTweet.name;
        qHandleEl.innerText = data.quotedTweet.handle;
        qTextEl.innerText = data.quotedTweet.text;
        qPfpEl.src = data.quotedTweet.pfpUrl;
        qTimestamp.innerText = data.quotedTweet.timestamp;
        quoteContainerEl.style.display = "block";
      }

      if (data.mediaItems && data.mediaItems.length > 0) {
        const mediaCount = data.mediaItems.length;

        // Apply the correct layout class to the container
        mediaContainer.className = "snapshot-media"; // Reset classes
        mediaContainer.classList.add(`layout-${Math.min(mediaCount, 4)}`);

        // Build the grid items from our clean data
        data.mediaItems.forEach((item) => {
          const cell = document.createElement("div");
          cell.className = "media-cell";

          const img = document.createElement("img");
          img.src = item.url;
          cell.appendChild(img);

          // Add a play icon overlay for videos/GIFs
          if (item.type === "video") {
            const playIcon = document.createElement("div");
            playIcon.className = "play-icon-overlay";
            playIcon.innerHTML = `<svg viewBox="0 0 24 24"><g><path d="M8 5v14l11-7z"></path></g></svg>`;
            cell.appendChild(playIcon);
          }

          mediaContainer.appendChild(cell);
        });

        mediaContainer.style.display = "grid";
      } else {
        mediaContainer.innerHTML = null;
        mediaContainer.style.display = "none";
      }

      // Set initial control states
      fontSizeInput.dispatchEvent(new Event("input"));
      textOnlyCheckbox.dispatchEvent(new Event("change"));
      hideDateTimeCheckbox.dispatchEvent(new Event("change"));

      // chrome.storage.local.remove("dataForSnapshot");
    } else {
      chrome.storage.local.remove("dataForSnapshot");
      document.body.innerHTML =
        "<h1>Error: Tweet data not found! Please try again.</h1>";
    }
  });
});
