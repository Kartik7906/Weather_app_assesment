const loggedInUserName = localStorage.getItem('loggedInUserName');
const loggedInUserId = localStorage.getItem('loggedInUserId');
const logoutbtn = document.querySelector('.logoutBtn');

// If there's no user in localStorage, maybe redirect to login
if (!loggedInUserId || !loggedInUserName) {
  console.log('No user logged in. Redirecting to login page...');
} else {
  // 2) Display the username in the userWorkSpace div
  const userWorkSpaceElement = document.querySelector('.userWorkSpace h1');
  if (userWorkSpaceElement) {
    userWorkSpaceElement.textContent = `${loggedInUserName} WorkSpace`;
  }
}

// 3) Logout functionality
logoutbtn.addEventListener('click', () => {
  localStorage.removeItem('loggedInUserId');
  localStorage.removeItem('loggedInUserName');
  window.location.href = 'login.html';
});


// public/script.js
const apiKey = '8a554d60aec87bfc28fffa27e04e3474';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=';

const searchBox = document.querySelector('.searchinputbox');
const searchBtn = document.querySelector('.searchbtn');
const currentLocationBtn = document.querySelector('.currentlocationbtn');

// Get the logged-in user ID from localStorage
const userId = localStorage.getItem('loggedInUserId');

// 1) Generic function to handle weather data once fetched:
async function handleWeatherData(data) {
  // Update UI
  document.querySelector('.CityName').innerText = data.name;
  document.querySelector('.temp').innerText = Math.round(data.main.temp) + '°C';
  document.querySelector('.humidity').innerText = data.main.humidity + '%';
  document.querySelector('.wind').innerText = data.wind.speed + ' km/h';

  // 2) Also send this data to the server to store in DB
  if (userId) {
    try {
      await fetch('/auth/storeSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          city: data.name,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          wind: data.wind.speed
        })
      });
    } catch (err) {
      console.error('Error storing search to DB:', err);
    }
  }
}

// 3) Fetch weather by city name
async function getWeatherData(city) {
  if (!city) {
    alert('Please enter a city name.');
    return;
  }
  try {
    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error(`City not found: ${response.status}`);
    }
    const data = await response.json();
    await handleWeatherData(data);
  } catch (error) {
    alert('Could not fetch the data. Please try a valid city name.');
  }
}

// 4) Fetch weather by geolocation
async function getWeatherByLocation(latitude, longitude) {
  try {
    const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    const response = await fetch(geoApiUrl);
    if (!response.ok) {
      throw new Error(`Could not get location: ${response.status}`);
    }
    const data = await response.json();
    await handleWeatherData(data);
  } catch (error) {
    alert('Error retrieving location-based weather data.');
  }
}

// 5) Event listeners
searchBtn.addEventListener('click', () => {
  const city = searchBox.value.trim();
  getWeatherData(city);
});

currentLocationBtn.addEventListener('click', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByLocation(latitude, longitude);
      },
      () => {
        alert('Unable to retrieve your location.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// 6) Load default city on page load
window.addEventListener('load', () => {
  getWeatherData('New York');
});
