(() => {
    const rnMin = document.getElementById('rn-min');
    const rnMax = document.getElementById('rn-max');
    const rnBtn = document.getElementById('rn-btn');
    const rnRes = document.getElementById('rn-res');

    const npList = document.getElementById('np-list');
    const npBtn = document.getElementById('np-btn');
    const npRes = document.getElementById('np-res');

    const roll = () => {
        const min = parseInt(rnMin.value);
        const max = parseInt(rnMax.value);
        if (isNaN(min) || isNaN(max) || min > max) {
            rnRes.textContent = 'Err';
            return;
        }
        const res = Math.floor(Math.random() * (max - min + 1)) + min;
        rnRes.textContent = res;
    };

    const pick = () => {
        const items = npList.value.split('\n').map(i => i.trim()).filter(i => i);
        if (items.length === 0) {
            npRes.textContent = '...';
            return;
        }
        const win = items[Math.floor(Math.random() * items.length)];
        npRes.textContent = win;
    };

    rnBtn.addEventListener('click', roll);
    npBtn.addEventListener('click', pick);

    window.currentCleanup = () => {
        rnBtn.removeEventListener('click', roll);
        npBtn.removeEventListener('click', pick);
    };
})();
