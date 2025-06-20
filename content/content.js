console.log("XShot: Content script loaded.");

// This variable will hold a reference to the tweet we're interested in.
let activeTweetArticle = null;

// --- Part 1: Detect the click on the "More" (...) button ---
// We listen for 'mousedown' on the whole document because it fires before the 'click' event
// that opens the menu. This gives us a chance to identify the tweet first.
document.body.addEventListener(
  "mousedown",
  (event) => {
    // The "More" button is usually identified by `data-testid="caret"`
    const moreButton = event.target.closest('[data-testid="caret"]');

    if (moreButton) {
      // We found it! The user clicked a "More" button.
      // Now, find the parent <article> element for this button.
      const article = moreButton.closest('article[data-testid="tweet"]');
      if (article) {
        console.log(
          "XShot: 'More' button clicked. Active tweet identified.",
          article
        );
        // Store this article element so the observer can use it.
        activeTweetArticle = article;
      }
    }
  },
  true
); // Use capture phase to run our code first.

// --- Part 2: The Function to Inject the Button ---
function addSnapshotButton(menuElement, tweetArticle) {
  if (!tweetArticle) {
    console.error(
      "XShot Error: Tried to add button, but no active tweet was identified. Aborting."
    );
  } else {
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

      console.log("XShot: Snapshot button clicked!");
      // The `tweetArticle` is now passed directly, making it reliable
      const tweetData = scrapeTweetData(tweetArticle);

      if (tweetData) {
        chrome.runtime.sendMessage({
          type: "CREATE_SNAPSHOT",
          data: tweetData,
        });
      } else {
        console.error(
          "XShot: Could not scrape tweet data from the identified article."
        );
      }
      document.body.click();
    });

    menuElement.appendChild(wrapper);
    console.log("XShot: Button successfully injected!");
  }
}

// --- Part 3: Watch for the Menu to Appear and Inject Our Button ---
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.addedNodes.length) {
      for (const node of mutation.addedNodes) {
        // Check if the added node is an element and contains the menu
        if (
          node.nodeType === 1 &&
          node.querySelector('[data-testid="Dropdown"]')
        ) {
          const menu = node.querySelector('[data-testid="Dropdown"]');
          // Ensure this menu is for a tweet and not something else
          const menuText = menu.innerText;
          if (
            menuText.includes("Embed post") ||
            menuText.includes("View post engagements") ||
            menuText.includes("Delete")
          ) {
            console.log("XShot: Tweet menu appeared. Injecting button.");
            // Pass the menu and our stored tweet article to the injection function
            addSnapshotButton(menu, activeTweetArticle);
            // We're done with this article, clear it to prevent reuse
            activeTweetArticle = null;
          }
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

function sanitizeTweetHTML(rawHTML) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rawHTML;

  // Remove any elements that Twitter uses for "Show more", etc.
  tempDiv
    .querySelectorAll('[data-testid="tweet-text-show-more-button"]')
    .forEach((el) => el.remove());

  let cleanedHTML = "";

  const iterator = document.createNodeIterator(tempDiv, NodeFilter.SHOW_ALL);
  let node;

  while ((node = iterator.nextNode())) {
    // This is the condition for TEXT nodes
    if (node.nodeType === Node.TEXT_NODE) {
      // THE CRITICAL FIX IS HERE:
      // Only add the text if its parent is NOT a link (A tag),
      // because if it is, we have already added it via outerHTML.
      if (node.parentElement.tagName.toUpperCase() !== "A") {
        cleanedHTML += node.textContent;
      }
    }
    // This is the condition for ELEMENT nodes
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toUpperCase();
      // We only keep the tags we explicitly want.
      if (tagName === "A" || tagName === "IMG" || tagName === "BR") {
        cleanedHTML += node.outerHTML;
      }
    }
  }
  return cleanedHTML;
}

// --- Part 4: The Scraper Function (NEW AND IMPROVED) ---
function scrapeTweetData(tweetArticle) {
  try {
    console.log("XShot: Starting scrape on article:", tweetArticle);

    // --- Profile Picture (Selector is reliable) ---
    const pfpElement = tweetArticle.querySelector(
      '[data-testid="Tweet-User-Avatar"] img'
    );
    const pfpUrl = pfpElement ? pfpElement.src : "";

    // --- User Info (New, more robust selectors) ---
    const userElement = tweetArticle.querySelector('[data-testid="User-Name"]');
    let name = "Name not found";
    let handle = "@handle_not_found";

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
      const nameElement = userElement.querySelector("a span span"); // Based on your HTML
      if (nameElement) {
        name = nameElement.innerText.trim();
      }
    }

    // --- Timestamp (FIXED: Using 'datetime' for precision) ---
    const timeElement = tweetArticle.querySelector("time");
    const rawTimestamp = timeElement
      ? timeElement.getAttribute("datetime")
      : "";
    let timestamp = "Time not found";
    if (rawTimestamp) {
      const date = new Date(rawTimestamp);
      // This formats the date exactly as requested, e.g., "8:34 PM · Jun 16, 2025"
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

    // --- Rich Text (CRITICAL for hashtags/mentions) ---
    const textElement = tweetArticle.querySelector('[data-testid="tweetText"]');
    let richText = "";
    let plainText = "";
    if (textElement) {
      // This is the key change: we clean the HTML before storing it.
      richText = sanitizeTweetHTML(textElement.innerHTML);
      plainText = textElement.innerText;
    }

    // --- Media Scraping (Images, Videos, GIFs) ---
    const mediaElements = tweetArticle.querySelectorAll(
      '[data-testid="tweetPhoto"] img, [data-testid="videoPlayer"] video'
    );
    const mediaUrls = Array.from(mediaElements).map((el) => {
      return {
        type: el.tagName === "IMG" ? "image" : "video",
        url:
          el.tagName === "IMG"
            ? el.src.replace(/name=\w+$/, "name=large")
            : el.poster, // get video thumbnail
      };
    });

    // --- Link Card Scraping ---
    let card = null;
    const cardWrapper = tweetArticle.querySelector(
      '[data-testid="card.wrapper"]'
    );
    if (cardWrapper) {
      const cardImage = cardWrapper.querySelector("img");
      const cardText = cardWrapper.querySelector(
        '[data-testid="card.layoutLarge.detail"]'
      );
      const cardTitle = cardWrapper.querySelector(
        '[data-testid="card.layoutLarge.title"]'
      );
      card = {
        imageUrl: cardImage ? cardImage.src : null,
        title: cardTitle ? cardTitle.innerText : "",
        description: cardText ? cardText.innerText : "",
      };
    }

    // --- Poll Scraping ---
    let poll = null;
    const pollWrapper = tweetArticle.querySelector('[data-testid^="poll"]');
    if (pollWrapper) {
      const pollChoices = pollWrapper.querySelectorAll(
        '[data-testid^="poll-choice-"]'
      );
      poll = Array.from(pollChoices).map((choice) => {
        const label = choice.querySelector(".r-115f2pl"); // Class for the choice label
        const percentage = choice.querySelector(".r-1jlq1w5"); // Class for the percentage
        return {
          label: label ? label.innerText : "",
          percentage: percentage ? percentage.innerText : "0%",
        };
      });
    }

    // --- Quote Tweet Scraping (Recursive) ---
    let quotedTweet = null;
    const quotedArticle = tweetArticle.querySelector(
      'div[role="link"] article[data-testid="tweet"]'
    );
    if (quotedArticle) {
      console.log("XShot: Quoted tweet found. Scraping recursively.");
      // Recursively call the scraper on the nested tweet
      quotedTweet = scrapeTweetData(quotedArticle);
    }

    const scrapedData = {
      name,
      handle,
      timestamp,
      pfpUrl,
      richText,
      plainText,
      mediaUrls,
      card,
      poll,
      quotedTweet,
    };
    console.log("XShot Scraped Data:", scrapedData);
    return scrapedData;
  } catch (error) {
    console.error("XShot Scraping Error:", error);
    return null;
  }
}
