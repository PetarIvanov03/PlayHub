(() => {
    const btnCompare = document.getElementById('dc-compare');
    const btnReset = document.getElementById('dc-reset');
    const inputs = document.getElementById('dc-inputs');
    const result = document.getElementById('dc-result');
    const orig = document.getElementById('dc-original');
    const mod = document.getElementById('dc-modified');

    const compare = () => {
        const t1 = orig.value.split('\n');
        const t2 = mod.value.split('\n');

        let html = '';
        const maxLen = Math.max(t1.length, t2.length);

        for (let i = 0; i < maxLen; i++) {
            const l1 = t1[i] !== undefined ? t1[i] : null;
            const l2 = t2[i] !== undefined ? t2[i] : null;

            if (l1 === l2) {
                html += `<div><span class="text-gray-400 mr-2">${i+1}</span> ${escapeHTML(l1)}</div>`;
            } else {
                if (l1 !== null) {
                    html += `<div class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"><span class="text-red-300 dark:text-red-800 mr-2">-</span> ${escapeHTML(l1)}</div>`;
                }
                if (l2 !== null) {
                    html += `<div class="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"><span class="text-green-300 dark:text-green-800 mr-2">+</span> ${escapeHTML(l2)}</div>`;
                }
            }
        }

        result.innerHTML = html;
        inputs.classList.add('hidden');
        result.classList.remove('hidden');
        btnCompare.classList.add('hidden');
        btnReset.classList.remove('hidden');
    };

    const reset = () => {
        inputs.classList.remove('hidden');
        result.classList.add('hidden');
        btnCompare.classList.remove('hidden');
        btnReset.classList.add('hidden');
    };

    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    };

    btnCompare.addEventListener('click', compare);
    btnReset.addEventListener('click', reset);

    window.currentCleanup = () => {
        btnCompare.removeEventListener('click', compare);
        btnReset.removeEventListener('click', reset);
    };
})();
