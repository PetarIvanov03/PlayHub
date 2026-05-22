(() => {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    const getWeatherCondition = (code) => {
        const conditions = {
            0: 'Clear Sky',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing Rime Fog',
            51: 'Light Drizzle',
            53: 'Moderate Drizzle',
            55: 'Dense Drizzle',
            56: 'Light Freezing Drizzle',
            57: 'Dense Freezing Drizzle',
            61: 'Slight Rain',
            63: 'Moderate Rain',
            65: 'Heavy Rain',
            66: 'Light Freezing Rain',
            67: 'Heavy Freezing Rain',
            71: 'Slight Snow Fall',
            73: 'Moderate Snow Fall',
            75: 'Heavy Snow Fall',
            77: 'Snow Grains',
            80: 'Slight Rain Showers',
            81: 'Moderate Rain Showers',
            82: 'Violent Rain Showers',
            85: 'Slight Snow Showers',
            86: 'Heavy Snow Showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with Slight Hail',
            99: 'Thunderstorm with Heavy Hail'
        };
        return conditions[code] || 'Unknown Condition';
    };

    const initWeather = () => {
        const searchInput = document.getElementById('weather-search-input');
        const searchBtn = document.getElementById('weather-search-btn');
        const statusMsg = document.getElementById('weather-status-msg');
        const weatherCard = document.getElementById('weather-card');

        const uiCity = document.getElementById('weather-city');
        const uiCountry = document.getElementById('weather-country');
        const uiTemp = document.getElementById('weather-temp');
        const uiCondition = document.getElementById('weather-condition');
        const uiHumidity = document.getElementById('weather-humidity');
        const uiWind = document.getElementById('weather-wind');

        let fetchAbortController = null;

        const updateStatus = (msg, isLoading = false, isError = false) => {
            statusMsg.textContent = msg;
            statusMsg.className = `text-sm mb-4 min-h-[1.25rem] ${isLoading ? 'animate-pulse text-indigo-500 dark:text-indigo-400' : isError ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400'}`;
        };

        const renderWeather = (data, city, country) => {
            uiCity.textContent = city || 'Unknown City';
            uiCountry.textContent = country || '--';
            uiTemp.textContent = `${Math.round(data.temperature)}°C`;
            uiCondition.textContent = getWeatherCondition(data.weathercode);
            uiHumidity.textContent = `${Math.round(data.relativehumidity || 0)}%`; // current_weather doesn't return humidity directly in open-meteo without hourly, will need specific params if requested, but let's assume we request it or fallback. Note: We'll modify the API call to include current hourly for humidity if needed, or just use what we get. Actually, current_weather doesn't have humidity. We should use current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
            uiWind.textContent = `${data.windspeed} km/h`;

            weatherCard.classList.remove('hidden');
            weatherCard.classList.add('flex');
        };

        const fetchWeatherData = async (lat, lon, cityName, countryName) => {
            updateStatus('Fetching weather data...', true);
            weatherCard.classList.add('hidden');
            weatherCard.classList.remove('flex');

            if (fetchAbortController) fetchAbortController.abort();
            fetchAbortController = new AbortController();

            try {
                // Using current=... is better for humidity, but instructions said current_weather=true.
                // Let's use the exact url provided: https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true
                // current_weather does not include humidity. I will add current=relative_humidity_2m to get it, or fallback.
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;
                const response = await fetch(url, { signal: fetchAbortController.signal });
                if (!response.ok) throw new Error('Failed to fetch weather data.');
                const data = await response.json();

                const current = data.current_weather;
                // Try to grab current humidity from hourly data (closest hour)
                let humidity = '--';
                if (data.hourly && data.hourly.time && data.hourly.relativehumidity_2m) {
                    const nowStr = current.time; // Format: "2023-10-10T14:00"
                    const index = data.hourly.time.indexOf(nowStr);
                    if (index !== -1) {
                        humidity = data.hourly.relativehumidity_2m[index];
                    } else {
                        humidity = data.hourly.relativehumidity_2m[0]; // fallback to first available
                    }
                }

                current.relativehumidity = humidity; // inject for render function

                renderWeather(current, cityName, countryName);
                updateStatus('', false);

            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error(err);
                updateStatus('Error fetching weather data. Please try again.', false, true);
            }
        };

        const handleSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;

            updateStatus('Searching for city...', true);
            weatherCard.classList.add('hidden');
            weatherCard.classList.remove('flex');

            if (fetchAbortController) fetchAbortController.abort();
            fetchAbortController = new AbortController();

            try {
                const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`;
                const response = await fetch(searchUrl, { signal: fetchAbortController.signal });
                if (!response.ok) throw new Error('Geocoding API failed.');
                const data = await response.json();

                if (!data.results || data.results.length === 0) {
                    updateStatus('City not found. Please try another search.', false, true);
                    return;
                }

                const result = data.results[0];
                fetchWeatherData(result.latitude, result.longitude, result.name, result.country || result.admin1 || '--');

            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error(err);
                updateStatus('Error searching for city. Please try again.', false, true);
            }
        };

        const onSearchKeyDown = (e) => {
            if (e.key === 'Enter') handleSearch();
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keydown', onSearchKeyDown);

        // Geolocation on start
        updateStatus('Locating you...', true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // Try to reverse geocode to get city name (optional, but good for UX)
                    // Open-Meteo doesn't have a direct free reverse geocoding API in the same format,
                    // but we can query by name. Let's just fetch weather directly for coordinates and use 'Your Location'.
                    fetchWeatherData(position.coords.latitude, position.coords.longitude, 'Your Location', 'Local');
                },
                (error) => {
                    console.warn('Geolocation denied or failed:', error);
                    updateStatus('Please search for a city above.');
                },
                { timeout: 10000 }
            );
        } else {
            updateStatus('Please search for a city above.');
        }

        // Cleanup
        window.currentCleanup = () => {
            if (fetchAbortController) fetchAbortController.abort();
            searchBtn.removeEventListener('click', handleSearch);
            searchInput.removeEventListener('keydown', onSearchKeyDown);
            weatherCard.classList.add('hidden');
            weatherCard.classList.remove('flex');
            searchInput.value = '';
            updateStatus('');
        };
    };

    // Run init
    initWeather();
})();