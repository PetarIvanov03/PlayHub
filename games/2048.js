(() => {
    const SIZE = 4;
    let grid = [];
    let score = 0;
    let gameOver = false;

    const tilesContainer = document.getElementById('g2-tiles');
    const scoreEl = document.getElementById('g2-score');
    const resetBtn = document.getElementById('g2-reset');
    const msgEl = document.getElementById('g2-msg');

    const colors = {
        2: 'bg-gray-100 text-gray-700',
        4: 'bg-orange-50 text-gray-700',
        8: 'bg-orange-200 text-orange-900',
        16: 'bg-orange-400 text-white',
        32: 'bg-red-400 text-white',
        64: 'bg-red-500 text-white',
        128: 'bg-yellow-400 text-white shadow-[0_0_10px_#facc15]',
        256: 'bg-yellow-400 text-white shadow-[0_0_15px_#facc15]',
        512: 'bg-yellow-500 text-white shadow-[0_0_20px_#eab308]',
        1024: 'bg-yellow-500 text-white text-3xl shadow-[0_0_25px_#eab308]',
        2048: 'bg-yellow-600 text-white text-3xl shadow-[0_0_30px_#ca8a04]'
    };

    const init = () => {
        grid = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        score = 0;
        gameOver = false;
        msgEl.classList.add('hidden');
        updateScore();
        addRandomTile();
        addRandomTile();
        render();
    };

    const addRandomTile = () => {
        let empty = [];
        for (let r=0; r<SIZE; r++) {
            for (let c=0; c<SIZE; c++) {
                if (grid[r][c] === 0) empty.push({r, c});
            }
        }
        if (empty.length > 0) {
            let {r, c} = empty[Math.floor(Math.random() * empty.length)];
            grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const render = () => {
        tilesContainer.innerHTML = '';
        const gap = 12; // 0.75rem (gap-3)
        for (let r=0; r<SIZE; r++) {
            for (let c=0; c<SIZE; c++) {
                if (grid[r][c] !== 0) {
                    const val = grid[r][c];
                    const tile = document.createElement('div');
                    const colorClass = colors[val] || 'bg-black text-white';
                    tile.className = `absolute flex items-center justify-center font-bold text-4xl rounded-lg ${colorClass} transition-all duration-150`;
                    tile.style.width = `calc(25% - 9px)`;
                    tile.style.height = `calc(25% - 9px)`;
                    tile.style.top = `calc(${r * 25}% + ${gap + (r*3)}px - 12px)`; // Rough visual approx
                    tile.style.left = `calc(${c * 25}% + ${gap + (c*3)}px - 12px)`;

                    // Slightly hacky precise positioning for exact fit in grid:
                    // Using percentages for positioning to match tailwind grid
                    tile.style.top = `${(r * 25)}%`;
                    tile.style.left = `${(c * 25)}%`;
                    tile.style.width = `calc(25% - 9px)`;
                    tile.style.height = `calc(25% - 9px)`;
                    tile.style.margin = `${r===0?0:(r*3)}px 0 0 ${c===0?0:(c*3)}px`; // Adjust gaps

                    tile.textContent = val;
                    tilesContainer.appendChild(tile);
                }
            }
        }
    };

    // Simplified movement logic
    const move = (dir) => {
        if(gameOver) return;
        let moved = false;

        const compress = (row) => {
            let newRow = row.filter(v => v !== 0);
            for(let i=0; i<newRow.length-1; i++){
                if(newRow[i] === newRow[i+1]){
                    newRow[i] *= 2;
                    score += newRow[i];
                    newRow[i+1] = 0;
                }
            }
            newRow = newRow.filter(v => v !== 0);
            while(newRow.length < SIZE) newRow.push(0);
            return newRow;
        };

        let tempGrid = JSON.parse(JSON.stringify(grid));

        if (dir === 'Left' || dir === 'Right') {
            for(let r=0; r<SIZE; r++) {
                let row = grid[r];
                if(dir === 'Right') row.reverse();
                row = compress(row);
                if(dir === 'Right') row.reverse();
                grid[r] = row;
            }
        } else if (dir === 'Up' || dir === 'Down') {
            for(let c=0; c<SIZE; c++) {
                let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
                if(dir === 'Down') col.reverse();
                col = compress(col);
                if(dir === 'Down') col.reverse();
                for(let r=0; r<SIZE; r++) grid[r][c] = col[r];
            }
        }

        if(JSON.stringify(tempGrid) !== JSON.stringify(grid)) {
            addRandomTile();
            updateScore();
            render();
            checkGameOver();
        }
    };

    const checkGameOver = () => {
        for(let r=0; r<SIZE; r++){
            for(let c=0; c<SIZE; c++){
                if(grid[r][c] === 0) return;
                if(c < SIZE-1 && grid[r][c] === grid[r][c+1]) return;
                if(r < SIZE-1 && grid[r][c] === grid[r+1][c]) return;
            }
        }
        gameOver = true;
        msgEl.classList.remove('hidden');
    };

    const updateScore = () => scoreEl.textContent = score;

    const handleKey = (e) => {
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)){
            e.preventDefault();
            move(e.key.replace('Arrow', ''));
        }
    };

    document.addEventListener('keydown', handleKey);
    resetBtn.addEventListener('click', init);

    init();

    window.currentCleanup = () => {
        document.removeEventListener('keydown', handleKey);
        resetBtn.removeEventListener('click', init);
    };
})();
