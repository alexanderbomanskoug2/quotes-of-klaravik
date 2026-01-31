const quotes = [
  { text: "Endast en gentleman äter röv", author: "Jerry" },
  { text: "Jag gillar inte saker som rimmar på bajs", author: "Jens Jacobsen" },
  { text: "De ska ge dig för mycket fjong", author: "Tova Westerlund" },
  { text: "Kenth har bönor i sin snusdosa!", author: "Fabian Olsson" },
  { text: "This IS the biggest one!", author: "Max Sjöstrand" },
  { text: "Varje gång en utvecklare säger ”ingen stress” gråter en projektledare", author: "Alexander Boman Skoug" },
  { text: "6 liter eller inget!", author: "Alexander Boman Skoug" },
  { text: "Det är inte kul att bli slagen, bara att bli skjuten", author: "Fabian Olsson" },
  { text: "Får ni också känaslan av att vi bara sitter är & leker vuxna?", author: "Tova Westerlund" }, 
  { text: "Leverera - att få lever strösslad över sin måltid (oftast av Max)", author: "Okänd" },
  { text: "Där e´ datajux jahh...", author: "Cecil Folkessson" },
  { text: "Vi har ett ordspråk, sparka på den Fabian som ligger ner", author: "Daniel Andersen" },
  { text: "Jens, vad va det du sa om hemmorroider", author: "Alexander Boman Skoug" },
  { text: "Ta det lungt, jag är snart medicinerad", author: "Jens Jacobsen" },
];

const quoteTextEl = document.getElementById('quoteText');
const quoteAuthorEl = document.getElementById('quoteAuthor');
const FADE_DURATION = 300; // ms (keep in sync with CSS)

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
  const stored = localStorage.getItem('quotePool');
  const storedIndex = localStorage.getItem('quoteIndex');

  if (stored && storedIndex !== null) {
    const pool = JSON.parse(stored);
    const index = parseInt(storedIndex, 10);

    // Validate that the pool is still valid (in case quotes were added/removed)
    if (pool.length === quotes.length && index < pool.length) {
      return { pool, currentIndex: index };
    }
  }

  // Create new shuffled pool
  const pool = shuffleArray([...Array(quotes.length).keys()]);
  return { pool, currentIndex: 0 };
}

function getNextQuoteIndex() {
  let { pool, currentIndex } = getQuotePool();

  // Get the current quote index
  const quoteIndex = pool[currentIndex];

  // Move to next position
  currentIndex++;

  // If we've exhausted the pool, reshuffle
  if (currentIndex >= pool.length) {
    pool = shuffleArray([...Array(quotes.length).keys()]);
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

document.addEventListener('DOMContentLoaded', () => {
  updateQuote();
});
document.addEventListener('click', showRandomWithFade);
document.addEventListener('keydown', onKeyDown);
