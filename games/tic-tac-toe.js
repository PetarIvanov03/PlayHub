(() => {
    let board = Array(9).fill('');
    let gameActive = true;
    const cells = document.querySelectorAll('#ttt-board > div');
    const status = document.getElementById('ttt-status');
    const resetBtn = document.getElementById('ttt-reset');

    const winCond = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    const checkWin = (b, p) => winCond.some(c => b[c[0]]===p && b[c[1]]===p && b[c[2]]===p);
    const getEmpty = (b) => b.map((v,i)=>v===''?i:null).filter(v=>v!==null);

    const minimax = (newBoard, player) => {
        const avail = getEmpty(newBoard);
        if (checkWin(newBoard, 'X')) return {score: -10};
        if (checkWin(newBoard, 'O')) return {score: 10};
        if (avail.length === 0) return {score: 0};

        let moves = [];
        for (let i = 0; i < avail.length; i++) {
            let move = { index: avail[i] };
            newBoard[avail[i]] = player;
            if (player === 'O') move.score = minimax(newBoard, 'X').score;
            else move.score = minimax(newBoard, 'O').score;
            newBoard[avail[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -10000;
            for(let i=0; i<moves.length; i++){
                if(moves[i].score > bestScore){ bestScore = moves[i].score; bestMove = i; }
            }
        } else {
            let bestScore = 10000;
            for(let i=0; i<moves.length; i++){
                if(moves[i].score < bestScore){ bestScore = moves[i].score; bestMove = i; }
            }
        }
        return moves[bestMove];
    };

    const aiMove = () => {
        if(!gameActive) return;
        const best = minimax([...board], 'O');
        if(best.index !== undefined) {
            board[best.index] = 'O';
            cells[best.index].textContent = 'O';
            cells[best.index].classList.add('text-rose-500');
            checkState();
        }
    };

    const checkState = () => {
        if(checkWin(board, 'X')) { status.textContent = 'You Win!'; status.className = 'text-green-500 mb-6 font-bold text-xl'; gameActive=false; return; }
        if(checkWin(board, 'O')) { status.textContent = 'AI Wins!'; status.className = 'text-red-500 mb-6 font-bold text-xl'; gameActive=false; return; }
        if(getEmpty(board).length === 0) { status.textContent = 'Draw!'; status.className = 'text-gray-500 mb-6 font-bold text-xl'; gameActive=false; return; }
    };

    const handleCell = (e) => {
        const idx = e.target.dataset.idx;
        if(board[idx] !== '' || !gameActive) return;
        board[idx] = 'X';
        e.target.textContent = 'X';
        e.target.classList.add('text-indigo-500');
        checkState();
        if(gameActive) setTimeout(aiMove, 100);
    };

    const reset = () => {
        board.fill('');
        gameActive = true;
        status.textContent = 'You (X) vs AI (O)';
        status.className = 'text-gray-500 mb-6 font-medium';
        cells.forEach(c => { c.textContent = ''; c.className = 'w-24 h-24 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-5xl font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'; });
    };

    cells.forEach(c => c.addEventListener('click', handleCell));
    resetBtn.addEventListener('click', reset);

    window.currentCleanup = () => {
        cells.forEach(c => c.removeEventListener('click', handleCell));
        resetBtn.removeEventListener('click', reset);
    };
})();
