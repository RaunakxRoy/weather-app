const apiKey = '0d94cf2ca333d260725d9cadf4ecc303';
const cityInput = document.querySelector(".city-input");
const btn = document.querySelector(".search-button");
const notFoundSection = document.querySelector(".not-found");
const weatherInfoSection = document.querySelector(".weather-info");
const searchCitySection = document.querySelector(".search-city");

const countryText = document.querySelector(".country-txt");
const correntDateText = document.querySelector(".current-date-txt"); // date
const currentTimeText = document.querySelector(".current-time-txt"); // time
const tempText = document.querySelector(".temp-txt");
const conditionText = document.querySelector(".condition-text");
const humidityText = document.querySelector(".humidity-value-txt");
const windText = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-img");
const forecastItemsContainer = document.querySelector(".forcast-items-container"); // forecast

let timeInterval;

btn.addEventListener("click", () => {
    if(cityInput.value.trim() !== ''){
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener("keydown", (evt) => {
    if(evt.key === "Enter" && cityInput.value.trim() !== ''){
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(endpoint, city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
    const resp = await fetch(apiUrl);
    return resp.json();
}

function getWeatherIcon(id){
    if(id <= 232) return "thunderstorm.svg";
    if(id <= 321) return "drizzle.svg";
    if(id <= 531) return "rain.svg";
    if(id <= 622) return "snow.svg";
    if(id <= 781) return "atmosphere.svg";
    if(id <= 800) return "clear.svg";
    return "clouds.svg";
}

async function updateWeatherInfo(city){
    const weatherData = await getFetchData('weather', city);
    if(weatherData.cod !== 200){
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: cityName,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
        timezone
    } = weatherData;

    // Set current weather info
    countryText.textContent = cityName;
    tempText.textContent = Math.round(temp) + ' °C';
    conditionText.textContent = main;
    humidityText.textContent = humidity + ' %';
    windText.textContent = speed + ' M/s';
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    // Set date
    const currDate = new Date();
    const dateOption = { weekday: 'short', day: '2-digit', month: 'short' };
    correntDateText.textContent = currDate.toLocaleDateString('en-GB', dateOption);

    // Set live time
    if(timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        const now = new Date(Date.now() + timezone * 1000);
        const hours = now.getUTCHours().toString().padStart(2, '0');
        const minutes = now.getUTCMinutes().toString().padStart(2, '0');
        const seconds = now.getUTCSeconds().toString().padStart(2, '0');
        currentTimeText.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);

    // Update forecast
    await updateForecastInfo(city);

    showDisplaySection(weatherInfoSection);
}

// Forecast function
async function updateForecastInfo(city) {
    const forecastData = await getFetchData('forecast', city);
    forecastItemsContainer.innerHTML = ''; // clear previous forecast

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Loop through forecast list and pick only "12:00:00" entries
    forecastData.list.forEach(item => {
        if (item.dt_txt.includes("12:00:00")) {
            const forecastDate = item.dt_txt.split(' ')[0];
            if (forecastDate !== today) { // skip today
                updateForecastItems(item, forecastData.city.timezone);
            }
        }
    });
}



function updateForecastItems(weatherData){
    const { dt_txt: date, weather: [{id}], main: {temp} } = weatherData;
    const dateTaken = new Date(date);
    const dateOption = { day: '2-digit', month: 'short' };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forcast-item">
            <h5 class="forcast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forcast-item-img">
            <h5 class="forcast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section){
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}
