document.addEventListener("DOMContentLoaded", () => {
  // Keep references to all our elements
  const snapshotContainer = document.getElementById("snapshot-container");
  const nameEl = document.getElementById("name");
  const handleEl = document.getElementById("handle");
  const pfpEl = document.getElementById("pfp");
  const textEl = document.getElementById("text");
  const timestampEl = document.getElementById("timestamp");

  const mediaContainer = document.getElementById("media-container");
  const cardContainer = document.getElementById("card-container");
  const pollContainer = document.getElementById("poll-container");
  const quotedTweetContainer = document.getElementById(
    "quoted-tweet-container"
  );

  const textOnlyCheckbox = document.getElementById("text-only-checkbox");
  const themeSelect = document.getElementById("theme-select");
  const dimensionSelect = document.getElementById("dimension-select");
  const downloadBtn = document.getElementById("download-btn");

  let currentTweetData = null; // Store the tweet data globally in this script

  // The master function to build the snapshot
  function renderSnapshot(data) {
    if (!data) return;

    // 1. Render Base Info (Always visible)
    nameEl.innerText = data.name;
    handleEl.innerText = data.handle;
    pfpEl.src = data.pfpUrl;
    timestampEl.innerText = data.timestamp;

    // Use richText for styled text, plainText as fallback
    textEl.innerHTML = data.richText || data.plainText;

    const isTextOnly = textOnlyCheckbox.checked;

    // 2. Conditionally Render Advanced Content
    mediaContainer.style.display = "none";
    cardContainer.style.display = "none";
    pollContainer.style.display = "none";
    quotedTweetContainer.style.display = "none";
    mediaContainer.innerHTML = ""; // Clear previous content
    cardContainer.innerHTML = "";
    pollContainer.innerHTML = "";
    quotedTweetContainer.innerHTML = "";

    if (!isTextOnly) {
      // Render Media
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        mediaContainer.style.display = "flex"; // Use flex as a base for layouts
        const numImages = data.mediaUrls.length;

        // Add a class to the container for specific styling
        mediaContainer.className = `media-container layout-${Math.min(
          numImages,
          4
        )}`;

        let mediaHTML = "";
        switch (numImages) {
          case 1:
            // Single image takes the full container
            mediaHTML = `<div class="image-wrapper"><img src="${data.mediaUrls[0].url}"></div>`;
            break;
          case 2:
            // Two images, side by side
            mediaHTML = `
                <div class="image-wrapper"><img src="${data.mediaUrls[0].url}"></div>
                <div class="image-wrapper"><img src="${data.mediaUrls[1].url}"></div>
            `;
            break;
          case 3:
            // One large image on the left, two small ones on the right
            mediaHTML = `
                <div class="image-wrapper main-pane"><img src="${data.mediaUrls[0].url}"></div>
                <div class="sub-pane">
                    <div class="image-wrapper"><img src="${data.mediaUrls[1].url}"></div>
                    <div class="image-wrapper"><img src="${data.mediaUrls[2].url}"></div>
                </div>
            `;
            break;
          default: // Covers 4 or more images in a 2x2 grid
            mediaContainer.className = `media-container layout-4`;
            mediaHTML = `
                <div class="image-wrapper"><img src="${data.mediaUrls[0].url}"></div>
                <div class="image-wrapper"><img src="${data.mediaUrls[1].url}"></div>
                <div class="image-wrapper"><img src="${data.mediaUrls[2].url}"></div>
                <div class="image-wrapper"><img src="${data.mediaUrls[3].url}"></div>
            `;
            break;
        }
        mediaContainer.innerHTML = mediaHTML;
      }

      // Render Polls
      if (data.poll && data.poll.length > 0) {
        pollContainer.style.display = "block";
        data.poll.forEach((choice) => {
          const choiceDiv = document.createElement("div");
          choiceDiv.className = "poll-choice";
          choiceDiv.innerHTML = `<span>${choice.label}</span><span>${choice.percentage}</span>`;
          pollContainer.appendChild(choiceDiv);
        });
      }

      // Render Quoted Tweet (as a simple version)
      if (data.quotedTweet) {
        quotedTweetContainer.style.display = "block";
        const qt = data.quotedTweet;
        quotedTweetContainer.innerHTML = `
                    <div class="quoted-tweet-header">
                        <img src="${qt.pfpUrl}" />
                        <b>${qt.name}</b>
                        <span style="margin-left: 5px; color: #536471;">${qt.handle}</span>
                    </div>
                    <div>${qt.plainText}</div>
                `;
      }
    }
  }

  // --- Event Listeners ---

  // Load data from storage and do the first render
  chrome.storage.local.get("tweetDataForSnapshot", (result) => {
    if (result.tweetDataForSnapshot) {
      currentTweetData = result.tweetDataForSnapshot;
      renderSnapshot(currentTweetData);
      chrome.storage.local.remove("tweetDataForSnapshot");
    } else {
      document.body.innerHTML =
        "<h1>Error: Tweet data not found. Please try again.</h1>";
    }
  });

  // Re-render when the "Text Only" checkbox is changed
  textOnlyCheckbox.addEventListener("change", () => {
    renderSnapshot(currentTweetData);
  });

  themeSelect.addEventListener("change", (e) => {
    snapshotContainer.className = e.target.value;
  });

  dimensionSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    snapshotContainer.style.width = "550px";
    snapshotContainer.style.height = "auto"; // Let content define height initially

    if (value === "instagram-post") {
      snapshotContainer.style.width = "540px";
      snapshotContainer.style.height = "540px";
    } else if (value === "instagram-story") {
      snapshotContainer.style.width = "540px";
      snapshotContainer.style.height = "960px";
    } else if (value === "youtube-thumb") {
      snapshotContainer.style.width = "640px";
      snapshotContainer.style.height = "360px";
    }
  });

  downloadBtn.addEventListener("click", () => {
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
    });
  });
});
