(() => {
    const input = document.getElementById('jf-input');
    const btnFormat = document.getElementById('jf-format');
    const btnMinify = document.getElementById('jf-minify');
    const errorMsg = document.getElementById('jf-error');

    const processJson = (spaces) => {
        const val = input.value.trim();
        if (!val) return;
        try {
            const parsed = JSON.parse(val);
            input.value = JSON.stringify(parsed, null, spaces);
            errorMsg.classList.add('hidden');
        } catch (e) {
            errorMsg.textContent = e.message;
            errorMsg.classList.remove('hidden');
        }
    };

    const handleFormat = () => processJson(4);
    const handleMinify = () => processJson(0);

    btnFormat.addEventListener('click', handleFormat);
    btnMinify.addEventListener('click', handleMinify);

    window.currentCleanup = () => {
        btnFormat.removeEventListener('click', handleFormat);
        btnMinify.removeEventListener('click', handleMinify);
    };
})();
