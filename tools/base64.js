(() => {
    const plain = document.getElementById('b64-plain');
    const encoded = document.getElementById('b64-encoded');

    const handlePlain = () => {
        try {
            encoded.value = btoa(unescape(encodeURIComponent(plain.value)));
        } catch (e) {
            encoded.value = 'Error encoding';
        }
    };

    const handleEncoded = () => {
        try {
            plain.value = decodeURIComponent(escape(atob(encoded.value)));
        } catch (e) {
            plain.value = 'Error decoding (Invalid Base64)';
        }
    };

    plain.addEventListener('input', handlePlain);
    encoded.addEventListener('input', handleEncoded);

    window.currentCleanup = () => {
        plain.removeEventListener('input', handlePlain);
        encoded.removeEventListener('input', handleEncoded);
    };
})();
