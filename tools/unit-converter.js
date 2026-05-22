(() => {
    const units = {
        length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 },
        weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
        temp: { c: 'c', f: 'f', k: 'k' }
    };

    let currentType = 'length';
    const tabs = document.querySelectorAll('.uc-tab');
    const inputEl = document.getElementById('uc-in');
    const outputEl = document.getElementById('uc-out');
    const unitInEl = document.getElementById('uc-unit-in');
    const unitOutEl = document.getElementById('uc-unit-out');

    const populateSelects = () => {
        unitInEl.innerHTML = '';
        unitOutEl.innerHTML = '';
        for (let u in units[currentType]) {
            unitInEl.options.add(new Option(u, u));
            unitOutEl.options.add(new Option(u, u));
        }
        if (currentType === 'length') unitOutEl.value = 'ft';
        if (currentType === 'weight') unitOutEl.value = 'lb';
        if (currentType === 'temp') unitOutEl.value = 'f';
    };

    const convert = () => {
        const val = parseFloat(inputEl.value);
        if (isNaN(val)) {
            outputEl.value = '';
            return;
        }

        const uIn = unitInEl.value;
        const uOut = unitOutEl.value;

        if (currentType === 'temp') {
            let inC;
            if (uIn === 'c') inC = val;
            else if (uIn === 'f') inC = (val - 32) * 5/9;
            else if (uIn === 'k') inC = val - 273.15;

            let res;
            if (uOut === 'c') res = inC;
            else if (uOut === 'f') res = (inC * 9/5) + 32;
            else if (uOut === 'k') res = inC + 273.15;

            outputEl.value = parseFloat(res.toFixed(4));
        } else {
            const map = units[currentType];
            const baseValue = val * map[uIn];
            const res = baseValue / map[uOut];
            outputEl.value = parseFloat(res.toFixed(6));
        }
    };

    const handleTabClick = (e) => {
        tabs.forEach(t => {
            t.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'font-medium');
            t.classList.add('text-gray-500');
        });
        e.target.classList.add('text-indigo-600', 'dark:text-indigo-400', 'font-medium');
        e.target.classList.remove('text-gray-500');

        currentType = e.target.dataset.type;
        populateSelects();
        convert();
    };

    tabs.forEach(t => t.addEventListener('click', handleTabClick));
    [inputEl, unitInEl, unitOutEl].forEach(el => el.addEventListener('input', convert));

    // Init
    populateSelects();
    convert();

    window.currentCleanup = () => {
        tabs.forEach(t => t.removeEventListener('click', handleTabClick));
        [inputEl, unitInEl, unitOutEl].forEach(el => el.removeEventListener('input', convert));
    };
})();
