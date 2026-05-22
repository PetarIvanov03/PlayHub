(() => {
    const canvas = document.getElementById('fb-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('fb-score');
    const msgEl = document.getElementById('fb-msg');
    const container = document.getElementById('fb-container');

    let reqId = null;
    let playing = false;
    let score = 0;
    let frame = 0;

    let bird = { x: 50, y: 150, v: 0, w: 20, h: 20, g: 0.25, jump: -5 };
    let pipes = [];
    const pipeW = 40;
    const gap = 120;

    const reset = () => {
        bird.y = 150;
        bird.v = 0;
        pipes = [];
        score = 0;
        frame = 0;
        scoreEl.textContent = score;
        msgEl.classList.add('hidden');
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Bird
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bird.x, bird.y, bird.w, bird.h);

        // Pipes
        ctx.fillStyle = '#10b981';
        pipes.forEach(p => {
            ctx.fillRect(p.x, 0, pipeW, p.top);
            ctx.fillRect(p.x, p.top + gap, pipeW, canvas.height - (p.top + gap));
        });
    };

    const update = () => {
        if (!playing) return;
        frame++;
        bird.v += bird.g;
        bird.y += bird.v;

        if (frame % 100 === 0) {
            const top = Math.random() * (canvas.height - gap - 40) + 20;
            pipes.push({ x: canvas.width, top: top, passed: false });
        }

        pipes.forEach((p, i) => {
            p.x -= 2;

            // Collision
            if (bird.x < p.x + pipeW && bird.x + bird.w > p.x &&
                (bird.y < p.top || bird.y + bird.h > p.top + gap)) {
                gameOver();
            }

            // Score
            if (p.x + pipeW < bird.x && !p.passed) {
                p.passed = true;
                score++;
                scoreEl.textContent = score;
            }
        });

        if (pipes.length > 0 && pipes[0].x < -pipeW) pipes.shift();

        if (bird.y > canvas.height || bird.y < 0) gameOver();

        draw();
        reqId = requestAnimationFrame(update);
    };

    const gameOver = () => {
        playing = false;
        msgEl.innerHTML = `<div class="text-3xl text-red-500 mb-2">Game Over</div><div class="text-sm">Click to restart</div>`;
        msgEl.classList.remove('hidden');
    };

    const flap = (e) => {
        e.preventDefault(); // prevent double tap zoom on mobile
        if (!playing) {
            reset();
            playing = true;
            update();
        }
        bird.v = bird.jump;
    };

    container.addEventListener('mousedown', flap);
    container.addEventListener('touchstart', flap);

    // Initial draw
    draw();

    window.currentCleanup = () => {
        if(reqId) cancelAnimationFrame(reqId);
        container.removeEventListener('mousedown', flap);
        container.removeEventListener('touchstart', flap);
    };
})();
