(() => {
    const text = document.getElementById('wc-text');
    const wordsEl = document.getElementById('wc-words');
    const charsEl = document.getElementById('wc-chars');
    const sentEl = document.getElementById('wc-sent');
    const timeEl = document.getElementById('wc-time');

    const update = () => {
        const val = text.value;
        const chars = val.length;

        // Words
        const wordsArr = val.trim().split(/\s+/).filter(w => w.length > 0);
        const words = wordsArr.length;

        // Sentences
        const sent = val.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

        // Read time (avg 225 wpm)
        const min = Math.ceil(words / 225) || 0;

        wordsEl.textContent = words;
        charsEl.textContent = chars;
        sentEl.textContent = sent;
        timeEl.textContent = min + 'm';
    };

    text.addEventListener('input', update);

    window.currentCleanup = () => {
        text.removeEventListener('input', update);
    };
})();
