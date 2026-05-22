(() => {
    const gridElement = document.getElementById('memory-grid');
    const movesDisplay = document.getElementById('memory-moves');
    const resetBtn = document.getElementById('memory-reset');

    const modal = document.getElementById('memory-modal');
    const modalContent = document.getElementById('memory-modal-content');
    const modalMsg = document.getElementById('memory-modal-msg');
    const modalClose = document.getElementById('memory-modal-close');

    const emojis = ['🚀', '🎸', '🍔', '🐶', '🏀', '☀️', '🌈', '🔥'];
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let isLocked = false;

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const flipCard = (e) => {
        if (isLocked) return;
        const card = e.currentTarget;
        if (card.classList.contains('flipped')) return;

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            checkForMatch();
        }
    };

    const createBoard = () => {
        gridElement.innerHTML = '';
        cards = [];
        const shuffledEmojis = shuffle([...emojis, ...emojis]);

        shuffledEmojis.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.index = index;
            card.dataset.emoji = emoji;

            const inner = document.createElement('div');
            inner.classList.add('memory-card-inner');

            const front = document.createElement('div');
            front.classList.add('memory-card-front');

            const back = document.createElement('div');
            back.classList.add('memory-card-back');
            back.textContent = emoji;

            inner.appendChild(front);
            inner.appendChild(back);
            card.appendChild(inner);

            card.addEventListener('click', flipCard);
            gridElement.appendChild(card);
            cards.push(card);
        });
    };

    const checkForMatch = () => {
        isLocked = true;
        const [card1, card2] = flippedCards;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            matchedPairs++;
            flippedCards = [];
            isLocked = false;

            if (matchedPairs === emojis.length) {
                setTimeout(() => gameOver(), 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                isLocked = false;
            }, 1000);
        }
    };

    const gameOver = () => {
        modalMsg.textContent = `Completed in ${moves} moves.`;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    };

    const closeModal = () => {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    const init = () => {
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        isLocked = false;
        movesDisplay.textContent = moves;
        closeModal();
        createBoard();
    };

    resetBtn.addEventListener('click', init);
    modalClose.addEventListener('click', init);

    // Initial load
    init();

    window.currentCleanup = () => {
        resetBtn.removeEventListener('click', init);
        modalClose.removeEventListener('click', init);
    };
})();
