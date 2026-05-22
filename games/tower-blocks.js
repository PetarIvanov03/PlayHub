(() => {
    const canvas = document.getElementById('tb-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('tb-score');
    const msgEl = document.getElementById('tb-msg');
    const container = document.getElementById('tb-container');

    let reqId, playing = false, score = 0, scrollY = 0;
    let blocks = [];
    let current = null;
    let dir = 1;
    let speed = 2;
    const blockH = 20;

    const reset = () => {
        blocks = [{x: 50, y: canvas.height - blockH, w: 200, color: '#9ca3af'}];
        score = 0;
        scrollY = 0;
        speed = 2;
        newBlock();
        scoreEl.textContent = score;
        msgEl.classList.add('hidden');
    };

    const newBlock = () => {
        const last = blocks[blocks.length-1];
        current = {
            x: 0,
            y: last.y - blockH,
            w: last.w,
            color: `hsl(${Math.random()*360}, 70%, 60%)`
        };
        dir = 1;
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(0, scrollY);

        blocks.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, blockH);
        });

        if (current) {
            ctx.fillStyle = current.color;
            ctx.fillRect(current.x, current.y, current.w, blockH);
        }

        ctx.restore();
    };

    const update = () => {
        if (!playing) return;

        current.x += speed * dir;
        if (current.x <= 0 || current.x + current.w >= canvas.width) dir *= -1;

        // Camera scroll
        const targetScroll = canvas.height - 100 - current.y;
        if (targetScroll > scrollY) scrollY += (targetScroll - scrollY) * 0.1;

        draw();
        reqId = requestAnimationFrame(update);
    };

    const drop = (e) => {
        e.preventDefault();
        if (!playing) {
            reset();
            playing = true;
            update();
            return;
        }

        const last = blocks[blocks.length-1];
        let diff = current.x - last.x;

        if (Math.abs(diff) < 5) {
            current.x = last.x; // Perfect drop
            diff = 0;
        }

        if (current.x + current.w <= last.x || current.x >= last.x + last.w) {
            gameOver();
            return;
        }

        if (diff > 0) current.w -= diff;
        else {
            current.w += diff;
            current.x = last.x;
        }

        blocks.push(current);
        score++;
        scoreEl.textContent = score;
        speed += 0.1;
        newBlock();
    };

    const gameOver = () => {
        playing = false;
        msgEl.innerHTML = `<div class="text-3xl text-red-500 mb-2">Game Over</div><div class="text-sm">Click to restart</div>`;
        msgEl.classList.remove('hidden');
    };

    container.addEventListener('mousedown', drop);
    container.addEventListener('touchstart', drop);

    // Initial draw
    reset();
    draw();

    window.currentCleanup = () => {
        if(reqId) cancelAnimationFrame(reqId);
        container.removeEventListener('mousedown', drop);
        container.removeEventListener('touchstart', drop);
    };
})();
