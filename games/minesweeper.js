(() => {
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

    const handleCellInteraction = (e) => {
        if (isGameOver) return;
        const r = parseInt(e.target.dataset.r);
        const c = parseInt(e.target.dataset.c);

        if (e.button === 2) {
            toggleFlag(r, c);
            return;
        }

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
            if (!grid[r][c].isMine && (r !== excludeR || c !== excludeC)) {
                grid[r][c].isMine = true;
                mineLocations.push([r, c]);
                minesPlaced++;
            }
        }

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

    const gameOver = (win) => {
        isGameOver = true;
        stopTimer();
        resetBtn.textContent = win ? '😎' : '😵';

        if (!win) {
            mineLocations.forEach(([r, c]) => {
                const cell = grid[r][c];
                if (!cell.isFlagged) {
                    cell.el.classList.remove('ms-cell-hidden');
                    cell.el.classList.add('ms-cell-revealed');
                    cell.el.textContent = '💣';
                }
            });
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

    const preventContext = e => e.preventDefault();
    gridElement.addEventListener('contextmenu', preventContext);

    // Initial Start
    init();

    window.currentCleanup = () => {
        resetBtn.removeEventListener('click', init);
        modalClose.removeEventListener('click', init);
        gridElement.removeEventListener('contextmenu', preventContext);
    };
})();
