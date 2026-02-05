const quoteTextEl = document.getElementById('quoteText');
const quoteAuthorEl = document.getElementById('quoteAuthor');
const slideshowButton = document.querySelector("#toggleSlideshow");
const watershedButton = document.querySelector("#toggleWatershed");
const FADE_DURATION = 300; // ms (keep in sync with CSS)
const SLIDESHOW_INTERVAL = 30000;
const quotes = window.quotes;

// Watershed functionality
function isOutsideOfficeHours() {
  const now = new Date();
  const hour = now.getHours();
  return hour < 8 || hour >= 17;
}

function getWatershedOverride() {
  return localStorage.getItem('watershedOverride') === 'true';
}

function setWatershedOverride(value) {
  localStorage.setItem('watershedOverride', value.toString());
}

function getFilteredQuotes() {
  const shouldShowWatershed = isOutsideOfficeHours() || getWatershedOverride();

  if (shouldShowWatershed) {
    return quotes; // Show all quotes
  } else {
    return quotes.filter(q => !q.watershed); // Filter out watershed quotes
  }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get or initialize the quote pool
function getQuotePool() {
  const filteredQuotes = getFilteredQuotes();
  const stored = localStorage.getItem('quotePool');
  const storedIndex = localStorage.getItem('quoteIndex');

  if (stored && storedIndex !== null) {
    const pool = JSON.parse(stored);
    const index = parseInt(storedIndex, 10);

    // Validate that the pool is still valid (in case quotes were added/removed or filter changed)
    const validPool = pool.filter(idx => {
      const quote = quotes[idx];
      return filteredQuotes.includes(quote);
    });

    if (validPool.length > 0 && index < pool.length) {
      return { pool: validPool, currentIndex: Math.min(index, validPool.length - 1), filteredQuotes };
    }
  }

  // Create new shuffled pool from filtered quotes
  const pool = shuffleArray(filteredQuotes.map(q => quotes.indexOf(q)));
  return { pool, currentIndex: 0, filteredQuotes };
}

function getNextQuoteIndex() {
  let { pool, currentIndex, filteredQuotes } = getQuotePool();

  // Get the current quote index
  const quoteIndex = pool[currentIndex];

  // Move to next position
  currentIndex++;

  // If we've exhausted the pool, reshuffle
  if (currentIndex >= pool.length) {
    pool = shuffleArray(filteredQuotes.map(q => quotes.indexOf(q)));
    currentIndex = 0;
  }

  // Save state
  localStorage.setItem('quotePool', JSON.stringify(pool));
  localStorage.setItem('quoteIndex', currentIndex.toString());

  return quoteIndex;
}

function updateQuote() {
  const quoteIndex = getNextQuoteIndex();
  const q = quotes[quoteIndex];
  quoteTextEl.textContent = q.text;
  quoteAuthorEl.textContent = "— " + q.author;
}

function showRandomWithFade() {
  if (!quoteTextEl || !quoteAuthorEl) return;

  // fade out
  quoteTextEl.classList.add('fade-out');
  quoteAuthorEl.classList.add('fade-out');

  // swap text after fade-out
  setTimeout(() => {
    updateQuote();

    // fade back in
    quoteTextEl.classList.remove('fade-out');
    quoteAuthorEl.classList.remove('fade-out');
  }, FADE_DURATION);
}

// Keyboard navigation
function onKeyDown(e) {
  if (
    e.code === 'Space' ||
    e.code === 'ArrowRight' ||
    e.code === 'ArrowDown'
  ) {
    e.preventDefault(); // prevent page scroll on Space
    showRandomWithFade();
  }
}

// Slideshow functionality
let slideshowInterval = null;

function toggleSlideshow() {
  if (slideshowInterval) {
    // Stop slideshow
    clearInterval(slideshowInterval);
    slideshowInterval = null;
    slideshowButton.innerHTML= "&#9654";
  } else {
    // Start slideshow
    slideshowButton.innerHTML = "&#9208";
    slideshowInterval = setInterval(showRandomWithFade, SLIDESHOW_INTERVAL);
  }
}

// Watershed toggle functionality
function toggleWatershed() {
  const currentOverride = getWatershedOverride();
  setWatershedOverride(!currentOverride);

  // Reset the quote pool when watershed state changes
  localStorage.removeItem('quotePool');
  localStorage.removeItem('quoteIndex');

  // Show a new quote immediately
  showRandomWithFade();
}

document.addEventListener('click', showRandomWithFade);
document.addEventListener('keydown', onKeyDown);

document.addEventListener('DOMContentLoaded', () => {
  updateQuote();
  updateWatershedButtonState();
});

slideshowButton.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent triggering the document click listener
  toggleSlideshow();
});

watershedButton.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent triggering the document click listener
  toggleWatershed();
});