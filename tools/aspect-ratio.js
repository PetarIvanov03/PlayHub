(() => {
    const rw = document.getElementById('ar-rw');
    const rh = document.getElementById('ar-rh');
    const w = document.getElementById('ar-w');
    const h = document.getElementById('ar-h');
    const box = document.getElementById('ar-box');

    const updateFromWidth = () => {
        const ratio = parseFloat(rw.value) / parseFloat(rh.value);
        if (ratio && w.value) {
            h.value = Math.round(parseFloat(w.value) / ratio);
            updateBox();
        }
    };

    const updateFromHeight = () => {
        const ratio = parseFloat(rw.value) / parseFloat(rh.value);
        if (ratio && h.value) {
            w.value = Math.round(parseFloat(h.value) * ratio);
            updateBox();
        }
    };

    const updateBox = () => {
        const ratio = parseFloat(rw.value) / parseFloat(rh.value);
        if (!isNaN(ratio) && ratio > 0) {
            if (ratio >= 1) {
                box.style.width = '160px';
                box.style.height = `${160 / ratio}px`;
            } else {
                box.style.height = '160px';
                box.style.width = `${160 * ratio}px`;
            }
        }
    };

    rw.addEventListener('input', updateFromWidth);
    rh.addEventListener('input', updateFromWidth);
    w.addEventListener('input', updateFromWidth);
    h.addEventListener('input', updateFromHeight);

    window.currentCleanup = () => {
        rw.removeEventListener('input', updateFromWidth);
        rh.removeEventListener('input', updateFromWidth);
        w.removeEventListener('input', updateFromWidth);
        h.removeEventListener('input', updateFromHeight);
    };
})();
