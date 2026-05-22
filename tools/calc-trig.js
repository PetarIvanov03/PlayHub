(() => {
    let isDegrees = true;
    const input = document.getElementById('trig-input');
    const sinDisplay = document.getElementById('trig-sin');
    const cosDisplay = document.getElementById('trig-cos');
    const tanDisplay = document.getElementById('trig-tan');
    const convDisplay = document.getElementById('trig-conv');
    const convLabel = document.getElementById('trig-conv-label');

    const degBtn = document.getElementById('unit-deg');
    const radBtn = document.getElementById('unit-rad');

    const calculate = () => {
        const val = parseFloat(input.value) || 0;
        const radians = isDegrees ? val * (Math.PI / 180) : val;

        sinDisplay.textContent = Math.sin(radians).toFixed(4);
        cosDisplay.textContent = Math.cos(radians).toFixed(4);

        const cosVal = Math.cos(radians);
        if (Math.abs(cosVal) < 1e-10) {
            tanDisplay.textContent = 'Undef';
        } else {
            tanDisplay.textContent = Math.tan(radians).toFixed(4);
        }

        if (isDegrees) {
            convDisplay.textContent = radians.toFixed(4);
        } else {
            convDisplay.textContent = (val * (180 / Math.PI)).toFixed(4);
        }
    };

    const setUnit = (deg) => {
        isDegrees = deg;
        if (isDegrees) {
            degBtn.classList.add('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
            degBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
            radBtn.classList.remove('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
            radBtn.classList.add('text-gray-500', 'dark:text-gray-400');
            convLabel.textContent = 'To Radians';
        } else {
            radBtn.classList.add('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
            radBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
            degBtn.classList.remove('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
            degBtn.classList.add('text-gray-500', 'dark:text-gray-400');
            convLabel.textContent = 'To Degrees';
        }
        calculate();
    };

    const handleDegClick = () => setUnit(true);
    const handleRadClick = () => setUnit(false);

    input.addEventListener('input', calculate);
    degBtn.addEventListener('click', handleDegClick);
    radBtn.addEventListener('click', handleRadClick);

    // Init
    calculate();

    window.currentCleanup = () => {
        input.removeEventListener('input', calculate);
        degBtn.removeEventListener('click', handleDegClick);
        radBtn.removeEventListener('click', handleRadClick);
    };
})();
