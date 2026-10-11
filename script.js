
const messages = [
  "Hey Mr Maifadi, please swipe",
  "I want to tell you something",
  "Wait for ittt",
  "Wait for it",
  "Ok I am going to say it now",
  "Are you ready?",
  "Wait a bit",
  "Kadlala kadlala let me be serious",
  "I think you are an amazing person...",
  "Inside and out",
  "Thank you for listening to my nonsense even when you didn't have to",
  "Thank you for showing me what love is if I can call you that",
  "I am crazy sometimes",
  "ok I know I am crazy ALL THE TIME",
  "but thank you for sticking around still",
  "I hate you saaarn",
  "BIG TIME!!!!!!!!!!!!!!",
  "Ok you can stop smiling now"
];

const book = document.getElementById("book");
const cover = document.getElementById("cover");
const openBookButton = document.getElementById("open-book");

const front = document.getElementById("page-front");
const frontContent = document.getElementById("front-content");
const underContent = document.getElementById("under-content");

const backButton = document.getElementById("back-button");
const nextButton = document.getElementById("next-button");
const progressBar = document.getElementById("progress-bar");
const chapterLabel = document.getElementById("chapter-label");
const swipeHint = document.getElementById("swipe-hint");

const coverImage = document.getElementById("cover-image");
const photoPlaceholder = document.getElementById("photo-placeholder");

let currentIndex = -1; // -1 means the cover
let isAnimating = false;
let isOpen = false;

function createPageContent(index) {
  if (index < 0 || index >= messages.length) {
    return "";
  }

  const page = document.createElement("div");
  page.className = "page-content";

  const kicker = document.createElement("p");
  kicker.className = "page-kicker";
  kicker.textContent = index < 2
    ? "A LITTLE NOTE FOR YOU"
    : index < 8
      ? "PLEASE BE PATIENT ♥"
      : index < 15
        ? "FROM ME TO YOU"
        : "IMPORTANT ANNOUNCEMENT";

  const message = document.createElement("h2");
  message.className = "page-message";
  message.textContent = messages[index];

  const ornament = document.createElement("div");
  ornament.className = "page-ornament";
  ornament.setAttribute("aria-hidden", "true");
  ornament.textContent = index === messages.length - 1
    ? "♥  THE END  ♥"
    : "♡  ✧  ♡";

  const hint = document.createElement("p");
  hint.className = "page-hint";
  hint.textContent = index === messages.length - 1
    ? "You've reached the end ♥"
    : "Swipe to turn the page →";

  const number = document.createElement("span");
  number.className = "page-number-inside";
  number.textContent = String(index + 1).padStart(2, "0");

  page.append(kicker, message, ornament, hint, number);
  return page;
}

function fillPage(container, index) {
  container.replaceChildren();

  const content = createPageContent(index);
  if (content) {
    container.appendChild(content);
  }
}

function updateControls() {
  const atCover = currentIndex === -1;
  const atEnd = currentIndex === messages.length - 1;

  backButton.disabled = atCover || isAnimating;
  nextButton.disabled = isAnimating;

  chapterLabel.textContent = atCover
    ? "THE COVER"
    : `PAGE ${String(currentIndex + 1).padStart(2, "0")} OF ${messages.length}`;

  progressBar.style.width = atCover
    ? "0%"
    : `${((currentIndex + 1) / messages.length) * 100}%`;

  nextButton.textContent = atEnd
    ? "Read it again ♥"
    : "Turn the page ♥";

  swipeHint.textContent = atEnd
    ? "The end... unless you want to read it again"
    : "Swipe left or tap to turn the page";
}

function showInitialPage() {
  fillPage(frontContent, 0);
  fillPage(underContent, 1);
  updateControls();
}

function openBook() {
  if (isAnimating || isOpen) return;

  isAnimating = true;
  isOpen = true;
  cover.classList.add("opening");
  openBookButton.disabled = true;

  setTimeout(() => {
    cover.style.display = "none";
    currentIndex = 0;
    isAnimating = false;
    showInitialPage();
    updateControls();
  }, 950);
}

function turnPage(direction) {
  if (!isOpen || isAnimating) return;

  // The last page loops back to the beginning.
  if (direction === 1 && currentIndex === messages.length - 1) {
    replayBook();
    return;
  }

  const targetIndex = currentIndex + direction;

  if (targetIndex < 0 || targetIndex >= messages.length) {
    return;
  }

  isAnimating = true;
  updateControls();

  // Prepare the page underneath before turning the current page.
  fillPage(underContent, targetIndex);

  front.classList.remove("turning-forward", "turning-backward");

  // Restart the animation cleanly.
  void front.offsetWidth;

  front.classList.add(
    direction === 1 ? "turning-forward" : "turning-backward"
  );

  setTimeout(() => {
    currentIndex = targetIndex;

    // Reset the physical page after the turn.
    front.classList.remove("turning-forward", "turning-backward");
    fillPage(frontContent, currentIndex);

    const nextIndex = currentIndex + 1;
    fillPage(underContent, nextIndex);

    isAnimating = false;
    updateControls();
  }, 730);
}

function replayBook() {
  if (isAnimating) return;

  isAnimating = true;
  cover.style.display = "block";
  cover.classList.remove("opening");
  void cover.offsetWidth;

  // Briefly reset the cover so it is ready to open again.
  currentIndex = -1;
  isOpen = false;
  front.classList.remove("turning-forward", "turning-backward");

  fillPage(frontContent, 0);
  fillPage(underContent, 1);

  backButton.disabled = true;
  nextButton.disabled = true;
  chapterLabel.textContent = "THE COVER";
  progressBar.style.width = "0%";
  nextButton.textContent = "Turn the page ♥";
  swipeHint.textContent = "Open the book to read your message";

  isAnimating = false;
  openBookButton.disabled = false;
}

openBookButton.addEventListener("click", openBook);

nextButton.addEventListener("click", () => {
  if (!isOpen) {
    openBook();
  } else {
    turnPage(1);
  }
});

backButton.addEventListener("click", () => turnPage(-1));

// Keyboard support: arrow keys turn pages.
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    if (!isOpen) {
      openBook();
    } else {
      turnPage(1);
    }
  }

  if (event.key === "ArrowLeft" && isOpen) {
    turnPage(-1);
  }
});

// Touch support: swipe left/right on the book.
let touchStartX = 0;
let touchStartY = 0;

book.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

book.addEventListener("touchend", (event) => {
  const endX = event.changedTouches[0].clientX;
  const endY = event.changedTouches[0].clientY;

  const deltaX = endX - touchStartX;
  const deltaY = endY - touchStartY;

  if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) {
    return;
  }

  if (!isOpen) {
    openBook();
  } else if (deltaX < 0) {
    turnPage(1);
  } else {
    turnPage(-1);
  }
}, { passive: true });

// Hide the placeholder when the photo loads successfully.
// If no photo is found, keep the decorative placeholder visible.
coverImage.addEventListener("load", () => {
  coverImage.style.display = "block";
  photoPlaceholder.style.display = "none";
});

coverImage.addEventListener("error", () => {
  coverImage.style.display = "none";
  photoPlaceholder.style.display = "flex";
});

showInitialPage();
