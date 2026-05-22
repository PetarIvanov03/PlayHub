(() => {
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('tetris-score');
    const startBtn = document.getElementById('tetris-start');

    const ROWS = 20, COLS = 10, BLOCK = 20;
    let board = [], score = 0, reqId = null, lastTime = 0, dropCounter = 0, dropInterval = 1000;

    const colors = [null, '#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#f97316', '#06b6d4'];
    const pieces = [
        [],
        [[1,1,1,1]], // I
        [[2,0,0],[2,2,2]], // J
        [[0,0,3],[3,3,3]], // L
        [[4,4],[4,4]], // O
        [[0,5,5],[5,5,0]], // S
        [[0,6,0],[6,6,6]], // T
        [[7,7,0],[0,7,7]]  // Z
    ];

    let player = { pos: {x: 0, y: 0}, matrix: null };

    const createMatrix = (w, h) => Array(h).fill().map(() => Array(w).fill(0));
    const drawMatrix = (matrix, offset) => {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = colors[value];
                    ctx.fillRect((x + offset.x) * BLOCK, (y + offset.y) * BLOCK, BLOCK-1, BLOCK-1);
                }
            });
        });
    };

    const collide = (arena, player) => {
        const m = player.matrix;
        const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const merge = (arena, player) => {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
            });
        });
    };

    const rotate = (matrix, dir) => {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) matrix.forEach(row => row.reverse());
        else matrix.reverse();
    };

    const playerReset = () => {
        const piecesKeys = [1,2,3,4,5,6,7];
        player.matrix = pieces[piecesKeys[Math.floor(Math.random() * piecesKeys.length)]];
        player.pos.y = 0;
        player.pos.x = Math.floor(COLS/2) - Math.floor(player.matrix[0].length/2);
        if (collide(board, player)) {
            board = createMatrix(COLS, ROWS);
            score = 0;
            updateScore();
        }
    };

    const playerDrop = () => {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
            merge(board, player);
            playerReset();
            arenaSweep();
        }
        dropCounter = 0;
    };

    const playerMove = (dir) => {
        player.pos.x += dir;
        if (collide(board, player)) player.pos.x -= dir;
    };

    const playerRotate = (dir) => {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(board, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir); // undo
                player.pos.x = pos;
                return;
            }
        }
    };

    const arenaSweep = () => {
        let rowCount = 1;
        outer: for (let y = ROWS - 1; y >= 0; --y) {
            for (let x = 0; x < COLS; ++x) {
                if (board[y][x] === 0) continue outer;
            }
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;
            score += rowCount * 10;
            rowCount *= 2;
        }
        updateScore();
    };

    const updateScore = () => scoreEl.textContent = score;

    const draw = () => {
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(board, {x: 0, y: 0});
        drawMatrix(player.matrix, player.pos);
    };

    const update = (time = 0) => {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) playerDrop();
        draw();
        reqId = requestAnimationFrame(update);
    };

    const handleKey = (e) => {
        if(!reqId) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); playerMove(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); playerMove(1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); playerDrop(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); playerRotate(1); }
    };

    const start = () => {
        board = createMatrix(COLS, ROWS);
        score = 0; updateScore();
        playerReset();
        if(reqId) cancelAnimationFrame(reqId);
        update();
        startBtn.blur();
    };

    document.addEventListener('keydown', handleKey);
    startBtn.addEventListener('click', start);

    window.currentCleanup = () => {
        if(reqId) cancelAnimationFrame(reqId);
        document.removeEventListener('keydown', handleKey);
        startBtn.removeEventListener('click', start);
    };
})();
