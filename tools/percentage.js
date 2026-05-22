(() => {
    const inputs = ['p1-x', 'p1-y', 'p2-x', 'p2-y', 'p3-x', 'p3-y'].map(id => document.getElementById(id));
    const [p1x, p1y, p2x, p2y, p3x, p3y] = inputs;

    const p1res = document.getElementById('p1-res');
    const p2res = document.getElementById('p2-res');
    const p3res = document.getElementById('p3-res');

    const calc = () => {
        // Form 1
        const v1x = parseFloat(p1x.value), v1y = parseFloat(p1y.value);
        if (!isNaN(v1x) && !isNaN(v1y)) p1res.textContent = parseFloat(((v1x / 100) * v1y).toFixed(4));
        else p1res.textContent = '0';

        // Form 2
        const v2x = parseFloat(p2x.value), v2y = parseFloat(p2y.value);
        if (!isNaN(v2x) && !isNaN(v2y) && v2y !== 0) p2res.textContent = parseFloat(((v2x / v2y) * 100).toFixed(4)) + '%';
        else p2res.textContent = '0%';

        // Form 3
        const v3x = parseFloat(p3x.value), v3y = parseFloat(p3y.value);
        if (!isNaN(v3x) && !isNaN(v3y) && v3x !== 0) {
            const diff = v3y - v3x;
            const pct = (diff / v3x) * 100;
            p3res.textContent = (pct > 0 ? '+' : '') + parseFloat(pct.toFixed(4)) + '%';
        } else p3res.textContent = '0%';
    };

    inputs.forEach(el => el.addEventListener('input', calc));

    window.currentCleanup = () => {
        inputs.forEach(el => el.removeEventListener('input', calc));
    };
})();
