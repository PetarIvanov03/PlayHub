document.addEventListener('DOMContentLoaded', () => {
    // === Core App State & Navigation ===
    const App = (() => {
        let currentCategory = 'tools';
        let currentSubTools = 'calc-standard';
        let currentSubGames = 'game-minesweeper';

        const navBtns = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.category-section');
        const subNavBtns = document.querySelectorAll('.subnav-btn');
        const subSections = document.querySelectorAll('.sub-section');

        // Theme Toggle
        const themeBtn = document.getElementById('theme-toggle');
        const darkIcon = document.getElementById('theme-icon-dark');
        const lightIcon = document.getElementById('theme-icon-light');

        const initTheme = () => {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                darkIcon.classList.add('hidden');
                lightIcon.classList.remove('hidden');
            } else {
                document.documentElement.classList.remove('dark');
                lightIcon.classList.add('hidden');
                darkIcon.classList.remove('hidden');
            }
        };

        themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.theme = 'dark';
                darkIcon.classList.add('hidden');
                lightIcon.classList.remove('hidden');
            } else {
                localStorage.theme = 'light';
                lightIcon.classList.add('hidden');
                darkIcon.classList.remove('hidden');
            }
        });

        // Navigation Switcher
        const switchCategory = (target) => {
            navBtns.forEach(btn => {
                if (btn.dataset.target === target) {
                    btn.classList.add('text-gray-900', 'dark:text-white');
                    btn.classList.remove('text-gray-500', 'dark:text-gray-400');
                } else {
                    btn.classList.remove('text-gray-900', 'dark:text-white');
                    btn.classList.add('text-gray-500', 'dark:text-gray-400');
                }
            });

            sections.forEach(sec => {
                if (sec.id === target) {
                    sec.classList.remove('hidden');
                    sec.classList.add('flex');
                } else {
                    sec.classList.add('hidden');
                    sec.classList.remove('flex');
                }
            });

            currentCategory = target;

            // Stop/Reset games when switching away
            if (target === 'tools') {
                if (window.Minesweeper) window.Minesweeper.stop();
            } else if (target === 'games') {
                switchSubCategory(currentSubGames);
            }
        };

        const switchSubCategory = (target) => {
            subNavBtns.forEach(btn => {
                if (btn.dataset.subtarget === target) {
                    btn.classList.add('border-gray-900', 'dark:border-white', 'text-gray-900', 'dark:text-white');
                    btn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                } else if (btn.closest('section').id === (target.startsWith('calc') ? 'tools' : 'games')) {
                    btn.classList.remove('border-gray-900', 'dark:border-white', 'text-gray-900', 'dark:text-white');
                    btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                }
            });

            subSections.forEach(sec => {
                if (sec.id === target) {
                    sec.classList.remove('hidden');
                } else if (sec.closest('section').id === (target.startsWith('calc') ? 'tools' : 'games')) {
                    sec.classList.add('hidden');
                }
            });

            if (target.startsWith('calc')) {
                currentSubTools = target;
            } else {
                currentSubGames = target;
                if (target === 'game-minesweeper' && window.Minesweeper) {
                    window.Minesweeper.init();
                } else if (target === 'game-memory' && window.MemoryMatch) {
                    window.MemoryMatch.init();
                    if (window.Minesweeper) window.Minesweeper.stop();
                }
            }
        };

        // Event Listeners
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => switchCategory(e.target.dataset.target));
        });

        subNavBtns.forEach(btn => {
            btn.addEventListener('click', (e) => switchSubCategory(e.target.dataset.subtarget));
        });

        // Init
        initTheme();
        switchCategory(currentCategory);
        switchSubCategory(currentSubTools);
        switchSubCategory(currentSubGames);

        return {
            switchCategory,
            switchSubCategory
        };
    })();

    // === Tools: Standard Calculator ===
    const Calculator = (() => {
        let displayValue = '0';
        let firstOperand = null;
        let waitingForSecondOperand = false;
        let operator = null;

        const display = document.getElementById('calc-display');
        const expressionDisplay = document.getElementById('calc-expression');

        const updateDisplay = () => {
            // Simple truncation to fit display, real apps might format better
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

        // Attach event listeners
        const buttons = document.querySelectorAll('.calc-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (event) => {
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
            });
        });

    })();

    // === Tools: Trigonometry Calculator ===
    const TrigCalculator = (() => {
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

            // Handle tangent undefined cases (like 90 deg)
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

        input.addEventListener('input', calculate);
        degBtn.addEventListener('click', () => setUnit(true));
        radBtn.addEventListener('click', () => setUnit(false));

        // Init
        calculate();

    })();

    // === Games: Minesweeper ===
    window.Minesweeper = (() => {
        const ROWS = 9;
        const COLS = 9;
        const MINES = 10;
        let grid = [];
        let mineLocations = [];
        let isGameOver = false;
        let isFirstClick = true;
        let flagsPlaced = 0;
        let cellsRevealed = 0;
        let timerInterval = null;
        let timeElapsed = 0;

        const gridElement = document.getElementById('ms-grid');
        const minesCounter = document.getElementById('mines-counter');
        const timerDisplay = document.getElementById('ms-timer');
        const resetBtn = document.getElementById('ms-reset-btn');

        const modal = document.getElementById('ms-modal');
        const modalContent = document.getElementById('ms-modal-content');
        const modalTitle = document.getElementById('ms-modal-title');
        const modalMsg = document.getElementById('ms-modal-msg');
        const modalClose = document.getElementById('ms-modal-close');

        const padZero = (num) => num.toString().padStart(3, '0');

        const startTimer = () => {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeElapsed++;
                if (timeElapsed <= 999) {
                    timerDisplay.textContent = padZero(timeElapsed);
                }
            }, 1000);
        };

        const stopTimer = () => {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        };

        const updateMinesCounter = () => {
            const remaining = MINES - flagsPlaced;
            minesCounter.textContent = padZero(remaining >= 0 ? remaining : 0);
        };

        const createBoard = () => {
            gridElement.innerHTML = '';
            grid = [];
            for (let r = 0; r < ROWS; r++) {
                const row = [];
                for (let c = 0; c < COLS; c++) {
                    const cell = document.createElement('div');
                    cell.classList.add('ms-cell', 'ms-cell-hidden');
                    cell.dataset.r = r;
                    cell.dataset.c = c;

                    cell.addEventListener('mousedown', handleCellInteraction);
                    cell.addEventListener('contextmenu', (e) => e.preventDefault());

                    gridElement.appendChild(cell);
                    row.push({
                        el: cell,
                        r, c,
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false,
                        neighborMines: 0
                    });
                }
                grid.push(row);
            }
        };

        const placeMines = (excludeR, excludeC) => {
            mineLocations = [];
            let minesPlaced = 0;
            while (minesPlaced < MINES) {
                const r = Math.floor(Math.random() * ROWS);
                const c = Math.floor(Math.random() * COLS);
                // Don't place on first click or already placed
                if (!grid[r][c].isMine && (r !== excludeR || c !== excludeC)) {
                    grid[r][c].isMine = true;
                    mineLocations.push([r, c]);
                    minesPlaced++;
                }
            }

            // Calculate neighbor mines
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (!grid[r][c].isMine) {
                        let count = 0;
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                const nr = r + dr;
                                const nc = c + dc;
                                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].isMine) {
                                    count++;
                                }
                            }
                        }
                        grid[r][c].neighborMines = count;
                    }
                }
            }
        };

        const getNumberColor = (num) => {
            const colors = [
                '',
                'text-blue-600 dark:text-blue-400',
                'text-green-600 dark:text-green-400',
                'text-red-600 dark:text-red-500',
                'text-purple-600 dark:text-purple-400',
                'text-yellow-600 dark:text-yellow-500',
                'text-cyan-600 dark:text-cyan-400',
                'text-black dark:text-white',
                'text-gray-600 dark:text-gray-400'
            ];
            return colors[num];
        };

        const revealCell = (r, c) => {
            const cellData = grid[r][c];
            if (cellData.isRevealed || cellData.isFlagged || isGameOver) return;

            cellData.isRevealed = true;
            cellsRevealed++;

            const el = cellData.el;
            el.classList.remove('ms-cell-hidden');
            el.classList.add('ms-cell-revealed');

            if (cellData.isMine) {
                el.textContent = '💣';
                el.classList.add('bg-red-500');
                gameOver(false);
                return;
            }

            if (cellData.neighborMines > 0) {
                el.textContent = cellData.neighborMines;
                const colorClass = getNumberColor(cellData.neighborMines);
                el.className += ` ${colorClass}`;
            } else {
                // Flood fill
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                            revealCell(nr, nc);
                        }
                    }
                }
            }

            if (cellsRevealed === (ROWS * COLS) - MINES) {
                gameOver(true);
            }
        };

        const toggleFlag = (r, c) => {
            const cellData = grid[r][c];
            if (cellData.isRevealed || isGameOver) return;

            if (!cellData.isFlagged && flagsPlaced < MINES) {
                cellData.isFlagged = true;
                cellData.el.textContent = '🚩';
                flagsPlaced++;
            } else if (cellData.isFlagged) {
                cellData.isFlagged = false;
                cellData.el.textContent = '';
                flagsPlaced--;
            }
            updateMinesCounter();
        };

        const handleCellInteraction = (e) => {
            if (isGameOver) return;
            const r = parseInt(e.target.dataset.r);
            const c = parseInt(e.target.dataset.c);

            // Right click or Long press (assumed standard mouse context for simplicity)
            if (e.button === 2) {
                toggleFlag(r, c);
                return;
            }

            // Left click
            if (e.button === 0) {
                if (grid[r][c].isFlagged) return;

                if (isFirstClick) {
                    isFirstClick = false;
                    placeMines(r, c);
                    startTimer();
                }

                resetBtn.textContent = '😮';
                setTimeout(() => { if(!isGameOver) resetBtn.textContent = '🙂'; }, 200);

                revealCell(r, c);
            }
        };

        const gameOver = (win) => {
            isGameOver = true;
            stopTimer();
            resetBtn.textContent = win ? '😎' : '😵';

            // Reveal all mines if loss
            if (!win) {
                mineLocations.forEach(([r, c]) => {
                    const cell = grid[r][c];
                    if (!cell.isFlagged) {
                        cell.el.classList.remove('ms-cell-hidden');
                        cell.el.classList.add('ms-cell-revealed');
                        cell.el.textContent = '💣';
                    }
                });
                // Check wrong flags
                for(let r=0; r<ROWS; r++) {
                    for(let c=0; c<COLS; c++) {
                        if (grid[r][c].isFlagged && !grid[r][c].isMine) {
                            grid[r][c].el.textContent = '❌';
                        }
                    }
                }
            }

            setTimeout(() => {
                modalTitle.textContent = win ? 'You Won!' : 'Game Over';
                modalMsg.textContent = win ? `Completed in ${timeElapsed} seconds.` : 'You hit a mine!';
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modalContent.classList.add('scale-100', 'opacity-100');
                }, 10);
            }, 500);
        };

        const closeModal = () => {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };

        const init = () => {
            isGameOver = false;
            isFirstClick = true;
            flagsPlaced = 0;
            cellsRevealed = 0;
            timeElapsed = 0;
            stopTimer();

            timerDisplay.textContent = '000';
            resetBtn.textContent = '🙂';
            updateMinesCounter();
            createBoard();
            closeModal();
        };

        resetBtn.addEventListener('click', init);
        modalClose.addEventListener('click', init);

        // Make board not show context menu
        gridElement.addEventListener('contextmenu', e => e.preventDefault());

        return {
            init,
            stop: stopTimer
        };
    })();

    // === Games: Memory Match ===
    window.MemoryMatch = (() => {
        const gridElement = document.getElementById('memory-grid');
        const movesDisplay = document.getElementById('memory-moves');
        const resetBtn = document.getElementById('memory-reset');

        const modal = document.getElementById('memory-modal');
        const modalContent = document.getElementById('memory-modal-content');
        const modalMsg = document.getElementById('memory-modal-msg');
        const modalClose = document.getElementById('memory-modal-close');

        const emojis = ['🚀', '🎸', '🍔', '🐶', '🏀', '☀️', '🌈', '🔥'];
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let isLocked = false;

        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const createBoard = () => {
            gridElement.innerHTML = '';
            cards = [];
            const shuffledEmojis = shuffle([...emojis, ...emojis]);

            shuffledEmojis.forEach((emoji, index) => {
                const card = document.createElement('div');
                card.classList.add('memory-card');
                card.dataset.index = index;
                card.dataset.emoji = emoji;

                const inner = document.createElement('div');
                inner.classList.add('memory-card-inner');

                const front = document.createElement('div');
                front.classList.add('memory-card-front');

                const back = document.createElement('div');
                back.classList.add('memory-card-back');
                back.textContent = emoji;

                inner.appendChild(front);
                inner.appendChild(back);
                card.appendChild(inner);

                card.addEventListener('click', flipCard);
                gridElement.appendChild(card);
                cards.push(card);
            });
        };

        const flipCard = (e) => {
            if (isLocked) return;
            const card = e.currentTarget;
            if (card.classList.contains('flipped')) return;

            card.classList.add('flipped');
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                moves++;
                movesDisplay.textContent = moves;
                checkForMatch();
            }
        };

        const checkForMatch = () => {
            isLocked = true;
            const [card1, card2] = flippedCards;

            if (card1.dataset.emoji === card2.dataset.emoji) {
                matchedPairs++;
                flippedCards = [];
                isLocked = false;

                if (matchedPairs === emojis.length) {
                    setTimeout(() => gameOver(), 500);
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    isLocked = false;
                }, 1000);
            }
        };

        const gameOver = () => {
            modalMsg.textContent = `Completed in ${moves} moves.`;
            modal.classList.remove('hidden');
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        };

        const closeModal = () => {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };

        const init = () => {
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            isLocked = false;
            movesDisplay.textContent = moves;
            closeModal();
            createBoard();
        };

        resetBtn.addEventListener('click', init);
        modalClose.addEventListener('click', init);

        return {
            init
        };
    })();

});
