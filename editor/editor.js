document.addEventListener("DOMContentLoaded", () => {
  // --- Element References ---
  const snapshotContainer = document.getElementById("snapshot-container");
  const nameEl = document.getElementById("name");
  const handleEl = document.getElementById("handle");
  const pfpEl = document.getElementById("pfp");
  const mainContentContainer = document.getElementById(
    "main-content-container"
  );

  const pollContainer = document.getElementById("poll-container");
  const timestampContainer = document.getElementById("timestamp-container");
  const themeSelect = document.getElementById("theme-select");
  const dimensionSelect = document.getElementById("dimension-select");
  const fontSizeInput = document.getElementById("font-size-input");
  const textOnlyCheckbox = document.getElementById("text-only-checkbox");
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
  textOnlyCheckbox.addEventListener("change", () => {
    if (textOnlyCheckbox.checked) {
      pollContainer.style.display = "none";
    } else {
      pollContainer.style.display = "block";
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

      // Set initial control states
      fontSizeInput.dispatchEvent(new Event("input"));
      textOnlyCheckbox.dispatchEvent(new Event("change"));

      // chrome.storage.local.remove("dataForSnapshot");
    } else {
      chrome.storage.local.remove("dataForSnapshot");
      document.body.innerHTML =
        "<h1>Error: Tweet data not found! Please try again.</h1>";
    }
  });
});
