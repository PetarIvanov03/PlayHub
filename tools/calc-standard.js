(() => {
    let displayValue = '0';
    let firstOperand = null;
    let waitingForSecondOperand = false;
    let operator = null;

    const display = document.getElementById('calc-display');
    const expressionDisplay = document.getElementById('calc-expression');

    const updateDisplay = () => {
        display.textContent = displayValue.length > 12 ? displayValue.substring(0, 12) + '...' : displayValue;
        if (operator && firstOperand !== null) {
            expressionDisplay.textContent = `${firstOperand} ${operator} ${waitingForSecondOperand ? '' : displayValue}`;
        } else {
            expressionDisplay.textContent = '';
        }
    };

    const inputDigit = (digit) => {
        if (waitingForSecondOperand === true) {
            displayValue = digit;
            waitingForSecondOperand = false;
        } else {
            displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    };

    const inputDecimal = (dot) => {
        if (waitingForSecondOperand === true) {
            displayValue = '0.';
            waitingForSecondOperand = false;
            return;
        }
        if (!displayValue.includes(dot)) {
            displayValue += dot;
        }
    };

    const handleOperator = (nextOperator) => {
        const inputValue = parseFloat(displayValue);

        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            updateDisplay();
            return;
        }

        if (firstOperand === null && !isNaN(inputValue)) {
            firstOperand = inputValue;
        } else if (operator) {
            const result = calculate(firstOperand, inputValue, operator);
            displayValue = `${parseFloat(result.toFixed(7))}`;
            firstOperand = result;
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
        updateDisplay();
    };

    const calculate = (first, second, op) => {
        if (op === '+') return first + second;
        if (op === '-') return first - second;
        if (op === '*') return first * second;
        if (op === '/') {
            if (second === 0) return 'Error';
            return first / second;
        }
        return second;
    };

    const handleEqual = () => {
        if (!operator || waitingForSecondOperand) return;
        const inputValue = parseFloat(displayValue);
        const result = calculate(firstOperand, inputValue, operator);

        expressionDisplay.textContent = `${firstOperand} ${operator} ${inputValue} =`;
        displayValue = `${parseFloat(result.toFixed(7))}`;
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = true;
        display.textContent = displayValue.length > 12 ? displayValue.substring(0, 12) + '...' : displayValue;
    };

    const resetCalculator = () => {
        displayValue = '0';
        firstOperand = null;
        waitingForSecondOperand = false;
        operator = null;
        updateDisplay();
    };

    const deleteDigit = () => {
        if (waitingForSecondOperand) return;
        if (displayValue.length > 1) {
            displayValue = displayValue.slice(0, -1);
        } else {
            displayValue = '0';
        }
        updateDisplay();
    };

    const handleBtnClick = (event) => {
        const { target } = event;
        const action = target.dataset.action;
        const val = target.dataset.val;

        if (!action) return;

        switch (action) {
            case 'number':
                if (val === '.') inputDecimal(val);
                else inputDigit(val);
                break;
            case 'operator':
                handleOperator(val);
                break;
            case 'clear':
                resetCalculator();
                break;
            case 'delete':
                deleteDigit();
                break;
            case 'equals':
                handleEqual();
                break;
        }

        if (action !== 'equals') {
            updateDisplay();
        }
    };

    const buttons = document.querySelectorAll('.calc-btn');
    buttons.forEach(btn => btn.addEventListener('click', handleBtnClick));

    // Cleanup logic (not strictly needed for pure DOM clicks inside dynamic content that gets overwritten, but good practice)
    window.currentCleanup = () => {
        buttons.forEach(btn => btn.removeEventListener('click', handleBtnClick));
    };
})();
