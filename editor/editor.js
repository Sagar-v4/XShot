document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("name");
  const handleEl = document.getElementById("handle");
  const textEl = document.getElementById("text");
  const pfpEl = document.getElementById("pfp");
  const timestampEl = document.getElementById("timestamp");
  const snapshotContainer = document.getElementById("snapshot-container");
  const mediaContainer = document.getElementById("media-container");

  const themeSelect = document.getElementById("theme-select");
  const dimensionSelect = document.getElementById("dimension-select");
  const downloadBtn = document.getElementById("download-btn");

  // 1. Retrieve the data from storage and populate the fields
  chrome.storage.local.get("tweetDataForSnapshot", (result) => {
    const data = result.tweetDataForSnapshot;
    if (data) {
      nameEl.innerText = data.name;
      handleEl.innerText = data.handle;
      textEl.innerText = data.text;
      pfpEl.src = data.pfpUrl;
      timestampEl.innerText = data.timestamp;

      if (data.mediaUrl) {
        const img = document.createElement("img");
        img.src = data.mediaUrl;
        mediaContainer.appendChild(img);
      }

      // Clean up the storage after use
      chrome.storage.local.remove("tweetDataForSnapshot");
    } else {
      document.body.innerHTML =
        "<h1>Error: Tweet data not found. Please try again.</h1>";
    }
  });

  // 2. Add event listeners for controls
  themeSelect.addEventListener("change", (e) => {
    snapshotContainer.className = e.target.value;
  });

  dimensionSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    snapshotContainer.style.width = "550px"; // Reset
    snapshotContainer.style.height = "auto";

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

  // 3. Handle the download button click
  downloadBtn.addEventListener("click", () => {
    // Use html2canvas to capture the div
    html2canvas(snapshotContainer, {
      allowTaint: true,
      useCORS: true,
      scale: 2, // Increase scale for better resolution
    }).then((canvas) => {
      // Create a link element
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
