const initPiano = () => {
    // 1. Setup Web Audio API Context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = new AudioContext();

    // Map of Notes to Frequencies
    const frequencies = {
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
        'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
        'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
        'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99
    };

    // Keep track of active oscillators to prevent re-triggering and allow stopping
    const activeOscillators = {};

    // State
    let sustainEnabled = false;

    // UI Elements
    const sustainBtn = document.getElementById('piano-sustain');
    const sustainKnob = document.getElementById('piano-sustain-knob');
    const keys = document.querySelectorAll('.piano-key');

    // Sustain Toggle Logic
    const toggleSustain = () => {
        sustainEnabled = !sustainEnabled;
        if (sustainEnabled) {
            sustainBtn.classList.replace('bg-gray-200', 'bg-indigo-600');
            sustainBtn.classList.replace('dark:bg-gray-600', 'dark:bg-indigo-500');
            sustainKnob.classList.replace('translate-x-1', 'translate-x-6');
        } else {
            sustainBtn.classList.replace('bg-indigo-600', 'bg-gray-200');
            sustainBtn.classList.replace('dark:bg-indigo-500', 'dark:bg-gray-600');
            sustainKnob.classList.replace('translate-x-6', 'translate-x-1');
        }
    };
    sustainBtn.addEventListener('click', toggleSustain);

    // ADSR Envelope Configuration
    const attackTime = 0.005;
    const decayTime = 0.1;
    const sustainLevel = 0.6;

    const playNote = (note, keyElement) => {
        if (!frequencies[note]) return;

        // Prevent double triggers if already holding
        if (activeOscillators[note]) return;

        // Resume AudioContext if suspended (browser autoplay policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Add visual active class
        if (keyElement) keyElement.classList.add('active');

        // Create Oscillator and Gain Node for the note
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // High fidelity sound: mix sine and triangle for a smooth electric piano feel
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequencies[note], audioCtx.currentTime);

        // Connect nodes
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Start Envelope (ADSR)
        const now = audioCtx.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(0, now);

        // Attack
        gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
        // Decay to Sustain
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);

        osc.start(now);

        // Store reference so we can release it later
        activeOscillators[note] = { osc, gainNode, keyElement };
    };

    const stopNote = (note) => {
        const active = activeOscillators[note];
        if (!active) return;

        // Remove visual active class
        if (active.keyElement) {
            active.keyElement.classList.remove('active');
        }

        const now = audioCtx.currentTime;
        const releaseTime = sustainEnabled ? 3.0 : 0.8;

        // Release phase
        active.gainNode.gain.cancelScheduledValues(now);
        active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, now); // lock current value
        active.gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

        // Stop oscillator after release completes
        active.osc.stop(now + releaseTime);

        // Remove from active tracking immediately so it can be re-triggered
        delete activeOscillators[note];
    };

    // Mouse/Touch Interaction
    const handlePointerDown = (e) => {
        // Prevent default to stop text selection/highlighting on rapid clicks
        e.preventDefault();
        const note = e.currentTarget.dataset.note;
        playNote(note, e.currentTarget);
    };

    const handlePointerUp = (e) => {
        e.preventDefault();
        const note = e.currentTarget.dataset.note;
        stopNote(note);
    };

    const handlePointerLeave = (e) => {
        const note = e.currentTarget.dataset.note;
        stopNote(note);
    };

    keys.forEach(key => {
        key.addEventListener('mousedown', handlePointerDown);
        key.addEventListener('touchstart', handlePointerDown);

        key.addEventListener('mouseup', handlePointerUp);
        key.addEventListener('touchend', handlePointerUp);

        key.addEventListener('mouseleave', handlePointerLeave);
        key.addEventListener('touchcancel', handlePointerLeave);
    });

    // Keyboard Interaction
    const keyMap = {};
    keys.forEach(key => {
        const kbKey = key.dataset.key;
        const note = key.dataset.note;
        if (kbKey) {
            keyMap[kbKey.toLowerCase()] = { note, element: key };
        }
    });

    const handleKeyDown = (e) => {
        // Ignore if modifier keys are pressed to avoid overriding browser shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const keyChar = e.key.toLowerCase();
        if (keyMap[keyChar]) {
            e.preventDefault(); // Prevent scrolling if space/enter etc
            // Only play if not repeating
            if (!e.repeat) {
                playNote(keyMap[keyChar].note, keyMap[keyChar].element);
            }
        }
    };

    const handleKeyUp = (e) => {
        const keyChar = e.key.toLowerCase();
        if (keyMap[keyChar]) {
            stopNote(keyMap[keyChar].note);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Lifecycle Cleanup
    window.currentCleanup = () => {
        // Remove global listeners
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);

        // Remove DOM listeners
        sustainBtn.removeEventListener('click', toggleSustain);
        keys.forEach(key => {
            key.removeEventListener('mousedown', handlePointerDown);
            key.removeEventListener('touchstart', handlePointerDown);
            key.removeEventListener('mouseup', handlePointerUp);
            key.removeEventListener('touchend', handlePointerUp);
            key.removeEventListener('mouseleave', handlePointerLeave);
            key.removeEventListener('touchcancel', handlePointerLeave);
        });

        // Close Audio Context to free hardware resources
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    };
};

// Execute initializer since script is injected dynamically via app.js
initPiano();
