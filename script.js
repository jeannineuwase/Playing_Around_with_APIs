const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "c3373dc8dc73ca98a28b640aa6491660";

const createWeatherCard = (cityName, weatherItem, index) => {
  const temperature = (weatherItem.main.temp - 273.15).toFixed(2);
  return `
    <div class="details">
      <h2>${index === 0 ? cityName : ""} (${
    weatherItem.dt_txt.split(" ")[0]
  })</h2>
      <h6>Temperature: ${temperature}°C</h6>
      <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
      <h6>Humidity: ${weatherItem.main.humidity}%</h6>
    </div>
    <div class="icon">
      <img src="https://openweathermap.org/img/wn/${
        weatherItem.weather[0].icon
      }@4x.png" alt="weather-icon">
      <h6>${weatherItem.weather[0].description}</h6>
    </div>
  `;
};

const updateWeatherData = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.innerHTML = html;
        } else {
          weatherCardsDiv.innerHTML += `<li class="card">${html}</li>`;
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) {
        alert(`No coordinates found for ${cityName}`);
        return;
      }
      const { lat, lon, name } = data[0];
      updateWeatherData(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          updateWeatherData(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. Please reset location permission to grant access again."
        );
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    getCityCoordinates();
  }
});
