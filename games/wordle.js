(() => {
    const WORDS = ["APPLE", "TRAIN", "HOUSE", "WATER", "LIGHT", "CHAIR", "TABLE", "PLANT", "PHONE", "MOUSE"];
    const target = WORDS[Math.floor(Math.random() * WORDS.length)];
    let grid = Array(6).fill().map(() => Array(5).fill(''));
    let row = 0, col = 0;
    let gameOver = false;

    const gridEl = document.getElementById('wordle-grid');
    const kbEl = document.getElementById('wordle-kb');
    const msgEl = document.getElementById('wordle-msg');
    const resetBtn = document.getElementById('wordle-reset');
    const container = document.getElementById('wordle-container');

    const renderGrid = () => {
        gridEl.innerHTML = '';
        grid.forEach((r, rIdx) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'grid grid-cols-5 gap-2';
            r.forEach((c, cIdx) => {
                const cell = document.createElement('div');
                cell.className = 'w-12 h-12 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-2xl font-bold uppercase transition-colors';
                cell.id = `cell-${rIdx}-${cIdx}`;
                cell.textContent = c;
                rowDiv.appendChild(cell);
            });
            gridEl.appendChild(rowDiv);
        });
    };

    const keys = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    const renderKb = () => {
        kbEl.innerHTML = '';
        keys.forEach((r, i) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'flex justify-center space-x-1';
            r.split('').forEach(k => {
                const btn = document.createElement('button');
                btn.className = 'px-2 py-3 bg-gray-200 dark:bg-gray-700 rounded font-bold text-sm min-w-[2rem] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';
                btn.textContent = k;
                btn.id = `key-${k}`;
                btn.onclick = () => handleInput(k);
                rowDiv.appendChild(btn);
            });
            if (i === 2) {
                const enter = document.createElement('button');
                enter.className = 'px-2 py-3 bg-gray-300 dark:bg-gray-600 rounded font-bold text-xs hover:bg-gray-400 transition-colors';
                enter.textContent = 'ENTER';
                enter.onclick = () => handleInput('Enter');
                rowDiv.insertBefore(enter, rowDiv.firstChild);

                const back = document.createElement('button');
                back.className = 'px-2 py-3 bg-gray-300 dark:bg-gray-600 rounded font-bold text-xs hover:bg-gray-400 transition-colors';
                back.textContent = 'DEL';
                back.onclick = () => handleInput('Backspace');
                rowDiv.appendChild(back);
            }
            kbEl.appendChild(rowDiv);
        });
    };

    const updateCell = (r, c, letter) => {
        grid[r][c] = letter;
        document.getElementById(`cell-${r}-${c}`).textContent = letter;
    };

    const submitGuess = () => {
        if(col < 5) {
            msgEl.textContent = 'Not enough letters';
            setTimeout(()=>msgEl.textContent='', 1500);
            return;
        }

        let guess = grid[row].join('');
        let targetArr = target.split('');
        let guessArr = guess.split('');
        let results = Array(5).fill('bg-gray-500 border-gray-500 text-white'); // default gray

        // Exact match (Green)
        for(let i=0; i<5; i++){
            if(guessArr[i] === targetArr[i]){
                results[i] = 'bg-green-500 border-green-500 text-white';
                targetArr[i] = null;
                guessArr[i] = null;
            }
        }

        // Partial match (Yellow)
        for(let i=0; i<5; i++){
            if(guessArr[i] !== null){
                let idx = targetArr.indexOf(guessArr[i]);
                if(idx > -1){
                    results[i] = 'bg-yellow-500 border-yellow-500 text-white';
                    targetArr[idx] = null;
                }
            }
        }

        // Apply colors
        for(let i=0; i<5; i++){
            const cell = document.getElementById(`cell-${row}-${i}`);
            cell.className = `w-12 h-12 border-2 flex items-center justify-center text-2xl font-bold uppercase transition-all duration-500 ${results[i]}`;

            // update kb
            const k = grid[row][i];
            const keyBtn = document.getElementById(`key-${k}`);
            if(keyBtn) {
                if(results[i].includes('green')) keyBtn.className = 'px-2 py-3 rounded font-bold text-sm min-w-[2rem] bg-green-500 text-white';
                else if(results[i].includes('yellow') && !keyBtn.className.includes('green')) keyBtn.className = 'px-2 py-3 rounded font-bold text-sm min-w-[2rem] bg-yellow-500 text-white';
                else if(!keyBtn.className.includes('green') && !keyBtn.className.includes('yellow')) keyBtn.className = 'px-2 py-3 rounded font-bold text-sm min-w-[2rem] bg-gray-600 text-white opacity-50';
            }
        }

        if(guess === target) {
            msgEl.textContent = 'You Win!';
            msgEl.className = 'h-6 font-bold text-green-500 mb-2';
            gameOver = true;
            resetBtn.classList.remove('hidden');
        } else {
            row++;
            col = 0;
            if(row > 5) {
                msgEl.textContent = target;
                gameOver = true;
                resetBtn.classList.remove('hidden');
            }
        }
    };

    const handleInput = (key) => {
        if (gameOver) return;
        if (key === 'Enter') {
            submitGuess();
        } else if (key === 'Backspace' && col > 0) {
            col--;
            updateCell(row, col, '');
        } else if (/^[A-Za-z]$/.test(key) && col < 5) {
            updateCell(row, col, key.toUpperCase());
            col++;
        }
    };

    const handleKey = (e) => handleInput(e.key);

    container.addEventListener('keydown', handleKey);
    resetBtn.addEventListener('click', () => document.querySelector('[data-view="games/wordle"]').click());

    renderGrid();
    renderKb();
    container.focus();

    window.currentCleanup = () => {
        container.removeEventListener('keydown', handleKey);
    };
})();
