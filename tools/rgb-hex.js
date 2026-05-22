(() => {
    const c1 = document.getElementById('c1');
    const c2 = document.getElementById('c2');
    const t1 = document.getElementById('t1');
    const t2 = document.getElementById('t2');
    const preview = document.getElementById('grad-preview');
    const cssOut = document.getElementById('css-out');
    const copyBtn = document.getElementById('copy-btn');

    const update = () => {
        t1.value = c1.value;
        t2.value = c2.value;
        const css = `linear-gradient(to right, ${c1.value}, ${c2.value})`;
        preview.style.background = css;
        cssOut.value = `background: ${css};`;
    };

    const updateFromText = (e) => {
        const val = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            if (e.target.id === 't1') c1.value = val;
            else c2.value = val;
            update();
        }
    };

    c1.addEventListener('input', update);
    c2.addEventListener('input', update);
    t1.addEventListener('input', updateFromText);
    t2.addEventListener('input', updateFromText);

    const handleCopy = () => {
        navigator.clipboard.writeText(cssOut.value);
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = orig, 1500);
    };
    copyBtn.addEventListener('click', handleCopy);

    update();

    window.currentCleanup = () => {
        c1.removeEventListener('input', update);
        c2.removeEventListener('input', update);
        t1.removeEventListener('input', updateFromText);
        t2.removeEventListener('input', updateFromText);
        copyBtn.removeEventListener('click', handleCopy);
    };
})();
