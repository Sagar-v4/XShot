console.log("XShot: Content script loaded.");

let activeTweetArticle = null;

// --- Part 1: Detect the click on the "More" (...) button ---
document.body.addEventListener(
  "mousedown",
  (event) => {
    const moreButton = event.target.closest('[data-testid="caret"]');
    if (moreButton) {
      activeTweetArticle = moreButton.closest('article[data-testid="tweet"]');
    }
  },
  true
);

// --- Part 2: Inject the Button into the Menu ---
function addSnapshotButton(menuElement, tweetArticle) {
  if (!tweetArticle) {
    console.error(
      "XShot Error: Tried to add button, but no active tweet was identified. Aborting."
    );
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.role = "menuitem";
  wrapper.tabIndex = "0";
  wrapper.className =
    "css-175oi2r r-1loqt21 r-18u37iz r-1mmae3n r-3pj75a r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l";
  wrapper.innerHTML = `
    <div class="css-175oi2r r-1777fci r-faml9v">
      <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1nao33i r-1q142lx">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 8.5h20v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-11z"></path>
          <path d="M7.5 8.5V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v2.5"></path>
          <circle cx="12" cy="14.5" r="3.5"></circle>
        </g>
      </svg>      
    </div>
    <div class="css-175oi2r r-16y2uox r-1wbh5a2"><div dir="ltr" class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-b88u0q" style="color: rgb(231, 233, 234);"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3">Create Snapshot with XShot</span></div></div>
    `;

  wrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const tweetData = scrapeTweetData(tweetArticle);
    if (tweetData) {
      chrome.runtime.sendMessage({ type: "CREATE_SNAPSHOT", data: tweetData });
    } else {
      console.error(
        "XShot: Could not scrape tweet data from the identified article."
      );
    }
    document.body.click();
  });

  menuElement.appendChild(wrapper);
}

// --- Part 3: Mutation Observer ---
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.addedNodes.length) {
      for (const node of mutation.addedNodes) {
        if (
          node.nodeType === 1 &&
          node.querySelector('[data-testid="Dropdown"]')
        ) {
          const menu = node.querySelector('[data-testid="Dropdown"]');
          const menuText = menu.innerText;
          if (
            menuText.includes("Embed post") ||
            menuText.includes("View post engagements") ||
            menuText.includes("Delete")
          ) {
            addSnapshotButton(menu, activeTweetArticle);
            activeTweetArticle = null;
          }
        }
      }
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// --- Part 4: The Scraper Function ---
function scrapeTweetData(tweetArticle) {
  let name = "Name not found";
  let handle = "@handle_not_found";
  let pfpUrl = "url_not_found";
  let timestamp = "Time not found";
  let mainContentContainer = "Content not found";
  try {
    // --- Header HTML (Grabs the container with PFP, name, handle, etc.) ---
    // --- Profile Picture (Selector is reliable) ---
    const pfpElement = tweetArticle.querySelector(
      '[data-testid="Tweet-User-Avatar"] img'
    );
    if (pfpElement) {
      pfpUrl = pfpElement.src;
    }

    // --- User Info ---
    const userElement = tweetArticle.querySelector('[data-testid="User-Name"]');
    if (userElement) {
      const allSpans = userElement.querySelectorAll("span");
      // This logic is more robust: find the span that is visibly a handle.
      for (const span of allSpans) {
        if (span.innerText.trim().startsWith("@")) {
          handle = span.innerText.trim();
          break;
        }
      }
      // The name is usually the very first piece of text in the user block.
      const nameElement = userElement.querySelector("a span span");
      if (nameElement) {
        name = nameElement.innerText.trim();
      }
    }

    // --- Main Content HTML (Grabs the container with text, media, polls, etc.) ---
    // 1. Find the stable text element, which exists in every tweet.
    const tweetTextElement = tweetArticle.querySelector(
      '[data-testid="tweetText"]'
    );

    // 2. Select its direct parent. This container reliably holds the text, media, polls, etc.
    if (tweetTextElement) {
      mainContentContainer = tweetTextElement.parentElement;
    }

    // --- Poll HTML (Scraped Separately) ---
    // We look for the poll card wrapper specifically.
    const pollElement = tweetArticle.querySelector(
      '[data-testid="card.wrapper"] [data-testid="cardPoll"]'
    );

    // --- Footer (Timestamp only) ---
    const timeElement = tweetArticle.querySelector("time");
    const rawTimestamp = timeElement
      ? timeElement.getAttribute("datetime")
      : "";
    if (rawTimestamp) {
      const date = new Date(rawTimestamp);
      timestamp =
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }) +
        " · " +
        date.toLocaleDateString("en-GB", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
    }

    const scrapedData = {
      name,
      handle,
      pfpUrl,
      timestamp,
      mainContentHTML: mainContentContainer
        ? mainContentContainer.innerHTML
        : "Content not found.",
      pollHTML: pollElement ? pollElement.outerHTML : null,
    };
    console.log("XShot Scraped Data:", scrapedData);
    return scrapedData;
  } catch (error) {
    console.error("XShot Scraping Error:", error);
    return {
      name,
      handle,
      pfpUrl,
      timestamp,
      mainContentHTML: "Scrape Error",
      pollHTML: null,
    };
  }
}
