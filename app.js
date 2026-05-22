document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-icon-dark');
    const lightIcon = document.getElementById('theme-icon-light');

    const initTheme = () => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        }
    };

    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        } else {
            localStorage.theme = 'light';
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        }
    });
    initTheme();

    // App Navigation and Lifecycle
    const dynamicContent = document.getElementById('dynamic-content');
    const navBtns = document.querySelectorAll('.nav-btn');

    // Track intervals/animation frames for cleanup
    window.AppIntervals = [];
    window.AppTimeouts = [];
    window.AppFrames = [];
    window.currentCleanup = null; // a function that can be exported by a module to clean up its specific event listeners/state

    const clearAllTimeoutsAndIntervals = () => {
        window.AppIntervals.forEach(clearInterval);
        window.AppIntervals = [];
        window.AppTimeouts.forEach(clearTimeout);
        window.AppTimeouts = [];
        window.AppFrames.forEach(cancelAnimationFrame);
        window.AppFrames = [];
        if (typeof window.currentCleanup === 'function') {
            window.currentCleanup();
            window.currentCleanup = null;
        }
    };

    // Replace default timers with tracking timers inside dynamic views
    const originalSetInterval = window.setInterval;
    window.setInterval = function(fn, delay) {
        const id = originalSetInterval(fn, delay);
        window.AppIntervals.push(id);
        return id;
    };
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(fn, delay) {
        const id = originalSetTimeout(fn, delay);
        window.AppTimeouts.push(id);
        return id;
    };
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function(fn) {
        const id = originalRequestAnimationFrame(fn);
        window.AppFrames.push(id);
        return id;
    };

    const loadView = async (view) => {
        clearAllTimeoutsAndIntervals();

        // Highlight active nav button
        navBtns.forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white');
                btn.classList.remove('text-gray-500');
            } else {
                btn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white');
                btn.classList.add('text-gray-500');
            }
        });

        if (view === 'home') {
            renderHomeGrid();
            return;
        }

        try {
            const htmlResponse = await fetch(`${view}.html`);
            if (!htmlResponse.ok) throw new Error('HTML not found');
            const htmlContent = await htmlResponse.text();
            dynamicContent.innerHTML = htmlContent;

            // Load module specific JS
            // Wait a tiny bit for DOM to be ready
            setTimeout(() => {
                const script = document.createElement('script');
                script.src = `${view}.js`;
                script.id = 'dynamic-script';
                // Remove old dynamic script if exists
                const oldScript = document.getElementById('dynamic-script');
                if (oldScript) oldScript.remove();
                document.body.appendChild(script);
            }, 0);

        } catch (error) {
            dynamicContent.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <div class="text-6xl mb-4">🚧</div>
                    <h2 class="text-2xl font-light">Under Construction</h2>
                    <p class="mt-2 text-sm">Module ${view} is not yet implemented.</p>
                </div>
            `;
        }
    };

    const renderHomeGrid = () => {
        const items = Array.from(navBtns).filter(btn => btn.dataset.view !== 'home').map(btn => {
            const view = btn.dataset.view;
            const title = btn.textContent;
            const isTool = view.startsWith('tools/');
            const icon = isTool ? '🔧' : '🎮';
            // Simple placeholder logic for image
            const bgClass = isTool ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-rose-50 dark:bg-rose-900/20';
            const textClass = isTool ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400';

            return `
                <div class="cursor-pointer group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow" onclick="document.querySelector('[data-view=\\'${view}\\']').click()">
                    <div class="h-32 flex items-center justify-center ${bgClass} ${textClass} text-5xl transition-transform group-hover:scale-105">
                        ${icon}
                    </div>
                    <div class="p-4 flex-grow flex items-center justify-center text-center">
                        <span class="font-medium text-sm text-gray-900 dark:text-gray-100">${title}</span>
                    </div>
                </div>
            `;
        });

        dynamicContent.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <h1 class="text-3xl font-light mb-8 text-gray-900 dark:text-white">All Utilities & Games</h1>
                <div class="app-grid">
                    ${items.join('')}
                </div>
            </div>
        `;
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => loadView(e.target.dataset.view));
    });

    // Initial load
    loadView('home');
});
