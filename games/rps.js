(() => {
    let sYou = 0, sCpu = 0, sDraw = 0;
    const emoji = { rock: '✊', paper: '✋', scissors: '✌️' };
    const choices = ['rock', 'paper', 'scissors'];

    const youEl = document.getElementById('rps-you');
    const cpuEl = document.getElementById('rps-cpu');
    const drawEl = document.getElementById('rps-draws');
    const p1 = document.getElementById('rps-p1');
    const p2 = document.getElementById('rps-p2');
    const msg = document.getElementById('rps-msg');

    const play = (e) => {
        const u = e.currentTarget.dataset.c;
        const c = choices[Math.floor(Math.random()*3)];

        p1.textContent = emoji[u];
        p2.textContent = emoji[c];

        // simple animation bump
        p1.classList.remove('scale-125'); p2.classList.remove('scale-125');
        void p1.offsetWidth;
        p1.classList.add('scale-125'); p2.classList.add('scale-125');

        if (u === c) {
            msg.textContent = "It's a Draw!";
            msg.className = 'h-6 font-bold text-xl text-gray-500';
            sDraw++; drawEl.textContent = sDraw;
        } else if (
            (u==='rock' && c==='scissors') ||
            (u==='paper' && c==='rock') ||
            (u==='scissors' && c==='paper')
        ) {
            msg.textContent = "You Win!";
            msg.className = 'h-6 font-bold text-xl text-green-500';
            sYou++; youEl.textContent = sYou;
        } else {
            msg.textContent = "CPU Wins!";
            msg.className = 'h-6 font-bold text-xl text-red-500';
            sCpu++; cpuEl.textContent = sCpu;
        }
    };

    const btns = document.querySelectorAll('.rps-btn');
    btns.forEach(b => b.addEventListener('click', play));

    window.currentCleanup = () => {
        btns.forEach(b => b.removeEventListener('click', play));
    };
})();
