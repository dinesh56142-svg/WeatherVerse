const apiKey = "6e88d43f68e1422e99c62b169cc9d848";

document.getElementById("searchBtn").addEventListener("click", searchCity);

// ================= AUTO LOCATION =================
window.onload = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            () => alert("Location denied. Use search.")
        );
    }
};

// ================= SEARCH =================
function searchCity() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Enter city name");
        return;
    }
    fetchWeatherByCity(city);
}

// ================= WEATHER BY CITY =================
async function fetchWeatherByCity(city) {
    try {
        const res = await fetch(
            "https://api.openweathermap.org/data/2.5/weather?q=" +
            city +
            "&appid=" +
            apiKey +
            "&units=metric"
        );
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);
        updateWeatherUI(data);
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// ================= WEATHER BY COORDS =================
async function fetchWeatherByCoords(lat, lon) {
    try {
        const res = await fetch(
            "https://api.openweathermap.org/data/2.5/weather?lat=" +
            lat +
            "&lon=" +
            lon +
            "&appid=" +
            apiKey +
            "&units=metric"
        );
        const data = await res.json();
        updateWeatherUI(data);
    } catch (err) {
        console.error(err);
    }
}

// ================= CROP SUGGESTION =================
function suggestCrop(temp, humidity) {
    if (temp >= 25 && humidity >= 60) return "Rice 🌾";
    if (temp >= 20 && temp < 30 && humidity < 60) return "Wheat 🌾";
    if (temp >= 30 && humidity < 50) return "Millets 🌿";
    if (temp >= 18 && temp <= 25) return "Vegetables 🥬";
    return "Pulses 🌱";
}

// ================= DAY / NIGHT BACKGROUND =================
function setDayNight(sunrise, sunset) {
    const now = Math.floor(Date.now() / 1000);

    // FORCE RESET
    document.body.className = "";

    if (now >= sunrise && now < sunset) {
        document.body.classList.add("day");
    } else {
        document.body.classList.add("night");
    }
}

// ================= AQI =================
async function fetchAQI(lat, lon) {
    try {
        const res = await fetch(
            "https://api.openweathermap.org/data/2.5/air_pollution?lat=" +
            lat +
            "&lon=" +
            lon +
            "&appid=" +
            apiKey
        );
        const data = await res.json();

        if (!data.list || !data.list[0]) {
            document.getElementById("aqi").innerText = "AQI: N/A";
            return;
        }

        const aqi = data.list[0].main.aqi;
        const levels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

        document.getElementById("aqi").innerText =
            "AQI: " + aqi + " (" + levels[aqi - 1] + ")";
    } catch {
        document.getElementById("aqi").innerText = "AQI: N/A";
    }
}

// ================= 7 DAY FORECAST =================
async function fetchForecast(lat, lon) {
    try {
        const res = await fetch(
            "https://api.openweathermap.org/data/2.5/forecast?lat=" +
            lat +
            "&lon=" +
            lon +
            "&appid=" +
            apiKey +
            "&units=metric"
        );
        const data = await res.json();

        let html = "";
        for (let i = 0; i < data.list.length; i += 8) {
            const day = data.list[i];
            const date = new Date(day.dt * 1000).toDateString();
            html += `<p>${date}: ${Math.round(day.main.temp)}°C</p>`;
        }
        document.getElementById("forecast").innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

// ================= UPDATE UI =================
function updateWeatherUI(data) {
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;

    document.getElementById("location").innerText =
        data.name + ", " + data.sys.country;

    document.getElementById("temperature").innerText = temp + "°C";
    document.getElementById("weather").innerText =
        data.weather[0].description;

    document.getElementById("humidity").innerText = humidity + "%";
    document.getElementById("wind").innerText = data.wind.speed + " m/s";
    document.getElementById("pressure").innerText =
        data.main.pressure + " hPa";

    document.getElementById("sunrise").innerText =
        new Date(data.sys.sunrise * 1000).toLocaleTimeString();

    document.getElementById("sunset").innerText =
        new Date(data.sys.sunset * 1000).toLocaleTimeString();

    document.getElementById("crop").innerText =
        "Best Crop: " + suggestCrop(temp, humidity);

    // IMPORTANT CALLS
    setDayNight(data.sys.sunrise, data.sys.sunset);
    fetchAQI(data.coord.lat, data.coord.lon);
    fetchForecast(data.coord.lat, data.coord.lon);
}