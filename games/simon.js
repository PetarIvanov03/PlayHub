(() => {
    let seq = [], playerSeq = [], level = 0, canPlay = false;
    const btns = document.querySelectorAll('.simon-btn');
    const startBtn = document.getElementById('simon-start');
    const score = document.getElementById('simon-score');
    const msg = document.getElementById('simon-msg');
    const board = document.getElementById('simon-board');

    // Simple beep sound generator
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    const freqs = [329.6, 261.6, 220, 164.8]; // E4, C4, A3, E3

    const playTone = (idx) => {
        if (!audioCtx) audioCtx = new AudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freqs[idx];
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    };

    const flash = (idx) => {
        return new Promise(res => {
            btns[idx].classList.remove('opacity-50');
            btns[idx].classList.add('opacity-100');
            playTone(idx);
            setTimeout(() => {
                btns[idx].classList.add('opacity-50');
                btns[idx].classList.remove('opacity-100');
                setTimeout(res, 200);
            }, 400);
        });
    };

    const playSeq = async () => {
        board.classList.add('pointer-events-none');
        canPlay = false;
        msg.textContent = 'Watch...';
        msg.className = 'mt-4 font-bold text-blue-500 h-6';

        await new Promise(r => setTimeout(r, 800));
        for(let i=0; i<seq.length; i++) {
            await flash(seq[i]);
        }

        msg.textContent = 'Your turn!';
        msg.className = 'mt-4 font-bold text-green-500 h-6';
        board.classList.remove('pointer-events-none');
        canPlay = true;
    };

    const nextLevel = () => {
        level++;
        score.textContent = level;
        playerSeq = [];
        seq.push(Math.floor(Math.random() * 4));
        playSeq();
    };

    const handlePress = (e) => {
        if(!canPlay) return;
        const idx = parseInt(e.target.dataset.c);
        flash(idx);
        playerSeq.push(idx);

        const currIdx = playerSeq.length - 1;
        if (playerSeq[currIdx] !== seq[currIdx]) {
            msg.textContent = 'Game Over!';
            msg.className = 'mt-4 font-bold text-red-500 h-6';
            canPlay = false;
            board.classList.add('pointer-events-none');
            startBtn.classList.remove('hidden');
            return;
        }

        if (playerSeq.length === seq.length) {
            canPlay = false;
            setTimeout(nextLevel, 1000);
        }
    };

    const start = () => {
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        seq = [];
        level = 0;
        startBtn.classList.add('hidden');
        msg.textContent = '';
        nextLevel();
    };

    btns.forEach(b => b.addEventListener('click', handlePress));
    startBtn.addEventListener('click', start);

    window.currentCleanup = () => {
        btns.forEach(b => b.removeEventListener('click', handlePress));
        startBtn.removeEventListener('click', start);
        if(audioCtx) audioCtx.close();
    };
})();
