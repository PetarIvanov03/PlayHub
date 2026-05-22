(() => {
    const out = document.getElementById('pw-out');
    const copy = document.getElementById('pw-copy');
    const len = document.getElementById('pw-len');
    const lenVal = document.getElementById('pw-len-val');
    const gen = document.getElementById('pw-gen');

    const upper = document.getElementById('pw-upper');
    const lower = document.getElementById('pw-lower');
    const num = document.getElementById('pw-num');
    const sym = document.getElementById('pw-sym');

    const chars = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        num: '0123456789',
        sym: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    const generate = () => {
        let charset = '';
        if (upper.checked) charset += chars.upper;
        if (lower.checked) charset += chars.lower;
        if (num.checked) charset += chars.num;
        if (sym.checked) charset += chars.sym;

        if (charset === '') {
            out.value = 'Select at least one option';
            return;
        }

        let password = '';
        const length = parseInt(len.value);
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        out.value = password;
    };

    const handleCopy = () => {
        if (!out.value || out.value === 'Select at least one option') return;
        navigator.clipboard.writeText(out.value);
        const orig = copy.textContent;
        copy.textContent = 'Copied!';
        setTimeout(() => copy.textContent = orig, 1500);
    };

    const handleInput = () => {
        lenVal.textContent = len.value;
        generate();
    };

    len.addEventListener('input', handleInput);
    upper.addEventListener('change', generate);
    lower.addEventListener('change', generate);
    num.addEventListener('change', generate);
    sym.addEventListener('change', generate);
    gen.addEventListener('click', generate);
    copy.addEventListener('click', handleCopy);

    generate();

    window.currentCleanup = () => {
        len.removeEventListener('input', handleInput);
        upper.removeEventListener('change', generate);
        lower.removeEventListener('change', generate);
        num.removeEventListener('change', generate);
        sym.removeEventListener('change', generate);
        gen.removeEventListener('click', generate);
        copy.removeEventListener('click', handleCopy);
    };
})();
