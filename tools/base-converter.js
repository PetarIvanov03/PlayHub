(() => {
    const inputs = {
        dec: { el: document.getElementById('bc-dec'), radix: 10, filter: /^[0-9]*$/ },
        bin: { el: document.getElementById('bc-bin'), radix: 2, filter: /^[01]*$/ },
        hex: { el: document.getElementById('bc-hex'), radix: 16, filter: /^[0-9a-fA-F]*$/ },
        oct: { el: document.getElementById('bc-oct'), radix: 8, filter: /^[0-7]*$/ }
    };

    const convert = (sourceKey, val) => {
        if (!val) {
            for (let k in inputs) inputs[k].el.value = '';
            return;
        }

        let decVal = parseInt(val, inputs[sourceKey].radix);
        if (isNaN(decVal)) return;

        for (let k in inputs) {
            if (k !== sourceKey) {
                let formatted = decVal.toString(inputs[k].radix);
                if (k === 'hex') formatted = formatted.toUpperCase();
                inputs[k].el.value = formatted;
            }
        }
    };

    const handleInput = (key) => (e) => {
        let val = e.target.value;
        if (!inputs[key].filter.test(val)) {
            e.target.value = val.slice(0, -1);
            return;
        }
        convert(key, e.target.value);
    };

    const listeners = [];
    for (let k in inputs) {
        const handler = handleInput(k);
        inputs[k].el.addEventListener('input', handler);
        listeners.push({ el: inputs[k].el, handler });
    }

    window.currentCleanup = () => {
        listeners.forEach(({el, handler}) => el.removeEventListener('input', handler));
    };
})();
