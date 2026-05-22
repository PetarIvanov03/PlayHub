(() => {
    const age = document.getElementById('h-age');
    const weight = document.getElementById('h-weight');
    const height = document.getElementById('h-height');
    const genders = document.getElementsByName('h-gender');
    const bmiEl = document.getElementById('h-bmi');
    const bmrEl = document.getElementById('h-bmr');

    const calc = () => {
        const a = parseFloat(age.value);
        const w = parseFloat(weight.value);
        const h = parseFloat(height.value);
        let g = 'm';
        genders.forEach(r => { if(r.checked) g = r.value });

        if (!a || !w || !h) {
            bmiEl.textContent = '0.0';
            bmrEl.textContent = '0';
            return;
        }

        // BMI: w / (h/100)^2
        const hM = h / 100;
        const bmi = w / (hM * hM);
        bmiEl.textContent = bmi.toFixed(1);

        // BMR Mifflin-St Jeor
        let bmr = (10 * w) + (6.25 * h) - (5 * a);
        bmr = g === 'm' ? bmr + 5 : bmr - 161;
        bmrEl.textContent = Math.round(bmr);
    };

    [age, weight, height].forEach(el => el.addEventListener('input', calc));
    genders.forEach(el => el.addEventListener('change', calc));

    calc();

    window.currentCleanup = () => {
        [age, weight, height].forEach(el => el.removeEventListener('input', calc));
        genders.forEach(el => el.removeEventListener('change', calc));
    };
})();
