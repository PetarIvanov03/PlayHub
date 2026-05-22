(() => {
    const textSample = "The quick brown fox jumps over the lazy dog. Programming is the art of algorithm design and the craft of debugging errant code. Typing fast is a matter of muscle memory and practice. Keep your fingers on the home row and do not look at the keyboard if you want to improve your speed.";

    const display = document.getElementById('st-text-display');
    const input = document.getElementById('st-input');
    const startBtn = document.getElementById('st-start');
    const overlay = document.getElementById('st-overlay');
    const wpmEl = document.getElementById('st-wpm');
    const accEl = document.getElementById('st-acc');
    const timeEl = document.getElementById('st-time');

    let chars = textSample.split('');
    let charEls = [];
    let timer = null;
    let timeLeft = 30;
    let isPlaying = false;
    let correctChars = 0;
    let totalTyped = 0;

    const initText = () => {
        // preserve overlay
        const ov = overlay.outerHTML;
        display.innerHTML = '';
        charEls = [];
        chars.forEach(c => {
            const span = document.createElement('span');
            span.textContent = c;
            span.className = 'text-gray-400';
            display.appendChild(span);
            charEls.push(span);
        });
        display.innerHTML += ov;
        // rebind start btn
        document.getElementById('st-start').addEventListener('click', start);
    };

    const updateStats = () => {
        // WPM = (total chars / 5) / time in min
        const timeElapsed = 30 - timeLeft;
        if(timeElapsed > 0) {
            const wpm = Math.round((correctChars / 5) / (timeElapsed / 60));
            wpmEl.textContent = wpm;
        }

        const acc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
        accEl.textContent = `${acc}%`;
    };

    const handleInput = () => {
        if(!isPlaying) return;
        const val = input.value;
        totalTyped++;

        // Reset all classes
        charEls.forEach(el => el.className = 'text-gray-400');

        correctChars = 0;

        val.split('').forEach((char, i) => {
            if (!charEls[i]) return;
            if (char === chars[i]) {
                charEls[i].className = 'text-green-500 bg-green-50 dark:bg-green-900/30';
                correctChars++;
            } else {
                charEls[i].className = 'text-red-500 bg-red-50 dark:bg-red-900/30';
            }
        });

        if (charEls[val.length]) {
            charEls[val.length].className = 'bg-indigo-200 dark:bg-indigo-900/50 text-gray-900 dark:text-white border-b-2 border-indigo-500';
        }

        updateStats();

        if (val.length >= chars.length) endGame();
    };

    const start = () => {
        isPlaying = true;
        timeLeft = 30;
        input.value = '';
        correctChars = 0;
        totalTyped = 0;
        timeEl.textContent = '30s';
        wpmEl.textContent = '0';
        accEl.textContent = '100%';

        document.getElementById('st-overlay').classList.add('opacity-0', 'pointer-events-none');
        input.focus();

        charEls.forEach(el => el.className = 'text-gray-400');
        if(charEls[0]) charEls[0].className = 'bg-indigo-200 dark:bg-indigo-900/50 text-gray-900 dark:text-white border-b-2 border-indigo-500';

        if(timer) clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            timeEl.textContent = timeLeft + 's';
            updateStats();
            if(timeLeft <= 0) endGame();
        }, 1000);
    };

    const endGame = () => {
        isPlaying = false;
        clearInterval(timer);
        input.blur();
        const ov = document.getElementById('st-overlay');
        ov.classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById('st-start').textContent = 'Play Again';
    };

    initText();
    input.addEventListener('input', handleInput);
    document.addEventListener('click', () => {
        if(isPlaying) input.focus();
    });

    window.currentCleanup = () => {
        if(timer) clearInterval(timer);
        input.removeEventListener('input', handleInput);
    };
})();
