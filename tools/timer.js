(() => {
    const display = document.getElementById('sw-display');
    const btnStart = document.getElementById('sw-start');
    const btnLap = document.getElementById('sw-lap');
    const btnReset = document.getElementById('sw-reset');
    const lapsDiv = document.getElementById('sw-laps');

    let startTime = 0;
    let elapsedTime = 0;
    let timerId = null;
    let laps = [];

    const formatTime = (ms) => {
        const date = new Date(ms);
        const h = date.getUTCHours().toString().padStart(2, '0');
        const m = date.getUTCMinutes().toString().padStart(2, '0');
        const s = date.getUTCSeconds().toString().padStart(2, '0');
        const msFormatted = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
        return `${h}:${m}:${s}.${msFormatted}`;
    };

    const updateDisplay = () => {
        display.textContent = formatTime(elapsedTime);
    };

    const toggleStart = () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            btnStart.textContent = 'Start';
            btnStart.classList.replace('bg-yellow-100', 'bg-green-100');
            btnStart.classList.replace('text-yellow-700', 'text-green-700');
            btnStart.classList.replace('dark:bg-yellow-900/30', 'dark:bg-green-900/30');
            btnStart.classList.replace('dark:text-yellow-400', 'dark:text-green-400');
        } else {
            startTime = Date.now() - elapsedTime;
            timerId = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                updateDisplay();
            }, 10);
            btnStart.textContent = 'Pause';
            btnStart.classList.replace('bg-green-100', 'bg-yellow-100');
            btnStart.classList.replace('text-green-700', 'text-yellow-700');
            btnStart.classList.replace('dark:bg-green-900/30', 'dark:bg-yellow-900/30');
            btnStart.classList.replace('dark:text-green-400', 'dark:text-yellow-400');
        }
    };

    const addLap = () => {
        if (!timerId && elapsedTime === 0) return;
        const currentLap = elapsedTime;
        const prevLap = laps.length > 0 ? laps[laps.length - 1].total : 0;
        const lapDiff = currentLap - prevLap;

        laps.push({ total: currentLap, diff: lapDiff });

        const el = document.createElement('div');
        el.className = 'flex justify-between py-2 text-sm font-mono border-b border-gray-100 dark:border-gray-800';
        el.innerHTML = `<span class="text-gray-500">Lap ${laps.length}</span> <span>+${formatTime(lapDiff)}</span> <span class="font-bold">${formatTime(currentLap)}</span>`;
        lapsDiv.prepend(el);
    };

    const reset = () => {
        if (timerId) toggleStart();
        elapsedTime = 0;
        laps = [];
        updateDisplay();
        lapsDiv.innerHTML = '';
    };

    btnStart.addEventListener('click', toggleStart);
    btnLap.addEventListener('click', addLap);
    btnReset.addEventListener('click', reset);

    window.currentCleanup = () => {
        if (timerId) clearInterval(timerId);
        btnStart.removeEventListener('click', toggleStart);
        btnLap.removeEventListener('click', addLap);
        btnReset.removeEventListener('click', reset);
    };
})();
