(() => {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    const score1 = document.getElementById('pong-p1');
    const score2 = document.getElementById('pong-p2');
    const msg = document.getElementById('pong-msg');
    const container = document.getElementById('pong-container');

    let reqId, playing = false;
    let s1 = 0, s2 = 0;
    const pW = 10, pH = 60;

    let ball = {x: 200, y: 150, r: 5, vx: 4, vy: 4};
    let p1 = {x: 10, y: 120};
    let p2 = {x: 380, y: 120};

    const resetBall = () => {
        ball.x = 200; ball.y = 150;
        ball.vx = (Math.random() > 0.5 ? 4 : -4);
        ball.vy = (Math.random() > 0.5 ? 4 : -4);
    };

    const draw = () => {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Net
        ctx.fillStyle = '#374151';
        for(let i=0; i<canvas.height; i+=20) ctx.fillRect(199, i, 2, 10);

        ctx.fillStyle = '#fff';
        // Paddles
        ctx.fillRect(p1.x, p1.y, pW, pH);
        ctx.fillRect(p2.x, p2.y, pW, pH);
        // Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
        ctx.fill();
    };

    const update = () => {
        if (!playing) return;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall collisions
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.vy *= -1;

        // Paddle collisions
        let player = ball.x < canvas.width/2 ? p1 : p2;
        if (ball.y >= player.y && ball.y <= player.y + pH &&
            ball.x - ball.r < player.x + pW && ball.x + ball.r > player.x) {
            ball.vx *= -1.1; // Speed up
            let collidePoint = (ball.y - (player.y + pH/2)) / (pH/2);
            ball.vy = collidePoint * 5;
        }

        // CPU AI
        p2.y += (ball.y - (p2.y + pH/2)) * 0.1;

        // Score
        if (ball.x - ball.r < 0) { s2++; score2.textContent = s2; resetBall(); }
        else if (ball.x + ball.r > canvas.width) { s1++; score1.textContent = s1; resetBall(); }

        draw();
        reqId = requestAnimationFrame(update);
    };

    const handleMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        p1.y = Math.max(0, Math.min(y - pH/2, canvas.height - pH));
    };

    const start = () => {
        if (playing) return;
        playing = true;
        s1 = 0; s2 = 0;
        score1.textContent = 0; score2.textContent = 0;
        msg.classList.add('hidden');
        resetBall();
        update();
    };

    container.addEventListener('mousedown', start);
    container.addEventListener('touchstart', start);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, {passive: false});

    draw();

    window.currentCleanup = () => {
        if(reqId) cancelAnimationFrame(reqId);
        container.removeEventListener('mousedown', start);
        container.removeEventListener('touchstart', start);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
    };
})();
