import express from "express";
import axios from "axios";
// import bodyParser from "body-parser";
import "dotenv/config";
import * as fs from "node:fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const port = 3000;

app.set("view engine", "ejs");

// Example Data
const eventResponse = {
  text: '``` JSON\n{\n  "events": [\n    {\n      "date": "2023-03-04",\n      "title": "Canberra Symphony Orchestra: The Planets",\n      "description": "The Canberra Symphony Orchestra presents a concert featuring Gustav Holst\'s epic orchestral suite, The Planets.",\n      "price": "$69-$129",\n      "link": "https://www.cso.org.au/concerts/the-planets"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "Canberra Writers Festival",\n      "description": "The Canberra Writers Festival is a celebration of literature and ideas, featuring a program of author talks, workshops, and events.",\n      "price": "Varies",\n      "link": "https://canberrawritersfestival.com.au/"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "Floriade: Commonwealth Park",\n      "description": "Floriade is an annual flower festival showcasing over a million blooms in Commonwealth Park.",\n      "price": "Free",\n      "link": "https://www.floriade.com.au/"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "Canberra Raiders vs. Wests Tigers",\n      "description": "The Canberra Raiders take on the Wests Tigers in a NRL match at GIO Stadium.",\n      "price": "$29-$99",\n      "link": "https://www.raiders.com.au/tickets"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "National Folk Festival",\n      "description": "The National Folk Festival is a four-day celebration of folk music, dance, and culture, featuring a program of concerts, workshops, and events.",\n      "price": "$180-$280",\n      "link": "https://www.folkfestival.org.au/"\n    }\n  ]\n}\n```',
}; // Maybe read from files instead on API call? Then can update to be axios api call later.

//// FUNCTIONS
// Read dummy data for use in Weather API. Delete once using real API call
async function readWeather() {
  try {
    const res = await fs.readFile(
      __dirname + "/dummy-data/dummy-weather-response.json"
    );
    return JSON.parse(res);
  } catch (err) {
    console.log(err);
  }
}

//// Get Longitude and Latitude of Location entered by user
async function getLatLong(locationName) {
  try {
    const apiResponse = await axios.get(
      process.env.LOCATION_IQ_SEARCH_API_URL,
      {
        params: {
          key: process.env.LOCATION_IQ_API_KEY,
          q: locationName,
          format: "json",
        },
      }
    );

    return `${apiResponse.data[0].lat}, ${apiResponse.data[0].lon}`;
  } catch (err) {
    console.log(err);
  }
}

//// Get weather forecast from tomorrow.io API
async function getWeather(latlong) {
  try {
    const apiResponse = await axios.get(
      process.env.TOMORROW_IO_FORECAST_API_URL,
      {
        params: {
          location: latlong,
          timesteps: "1d",
          units: "metric",
          apikey: process.env.TOMORROW_IO_API_KEY,
        },
      }
    );

    return apiResponse.data;
  } catch (err) {
    console.log(err);
  }
}

//// Extract Temperature Forecast and Weather Code from tomorrow.io response, for required dates

function parseWeather(userDates, forecast, filePathList) {
  let weather = {};
  weather.daily = [];

  //// Convert userDates to 10char string in format YYYY-MM-DD
  const forecastDates = forecast.timelines.daily;

  userDates.forEach((date) => {
    const stringUserDate = `${date.getFullYear()}-${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;

    //// Compare userDates against dates in response from tomorrow.io to get respective 'temp' and 'weather code'
    for (let i = 0; i < forecastDates.length; i++) {
      if (stringUserDate == forecastDates[i].time.slice(0, 10)) {
        const weatherIconPath = getWeatherIcon(
          forecastDates[i].values.weatherCodeMax,
          filePathList
        ); // get file path for weather icon

        const dateMatch = {
          date: stringUserDate,
          temperatureMax_degC:
            forecastDates[i].values.temperatureMax.toFixed(1), //round to 1dp
          weather_code: forecastDates[i].values.weatherCodeMax.toString(),
          weather_icon_path: weatherIconPath,
        };
        weather.daily.push(dateMatch);
      }
    }
  });

  return weather;
}

function getWeatherIcon(weatherCode, filePathList) {
  try {
    let iconPath = "";
    const weatherCodeDay = weatherCode * 10;

    filePathList.forEach((path) => {
      if (path.slice(0, 5) == weatherCodeDay && path.slice(-7) == "@2x.png") {
        iconPath = path;
      }
    });

    return iconPath;
  } catch (err) {
    console.log(err.name, err.message);
  }
}

//// MIDDLEWARE
app.use(express.static("public"));

app.use(express.json());

// app.use(bodyParser.json()); //// I don't think I need bodyParser anymore. test without
// app.use(bodyParser.urlencoded({ extended: true }));

//// ROUTES
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/autocomplete"),
  (req, res) => {
    // Going to run autocomplete via server to protect API keys. May result in latency though :'( )
  };

app.post("/search-events", (req, res) => {
  // Route only reached through JS fetch request on Search button click (or refresh of page with query params in URL)
  // Open dummy data files for weather and event
  // Clean Content
  // Send data back to client side for JS to render
});

app.post("/search-weather", async (req, res) => {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const userLocationName = req.body.locationName;
    const userDates = [
      new Date(req.body.date_range[0]),
      new Date(req.body.date_range[1]),
    ];

    const weatherIconPathList = await fs.readdir(
      path.join(__dirname, "/public/images/weather-icons/png")
    );

    //// Geocode Location input by user
    // const latlong = "-35.2975906, 149.1012676"; // fake return from API request for testing
    const latLong = await getLatLong(userLocationName);

    //// Get 5-day weather forecast from tomorrow.io
    // const weatherResponse = await readWeather(); // fake API request (reads dummy data). Change to 'getweather()' (Below) when ready to link it all up
    const weatherResponse = await getWeather(latLong); // For live

    //// Compare user's dates to weatherResponse dates to find the respective forecasts
    const weather = parseWeather(
      userDates,
      weatherResponse,
      weatherIconPathList
    );

    res.status(200).send(weather);
  } catch (err) {
    console.log(err);
  }

  // Route only reached through JS fetch request on Search button click (or refresh of page with query params in URL)
  // Open dummy data files for weather
  // Clean Content
  // Search weather icon file names for one that contains the weather code
  // Send data back to client side for JS to render
});

app.listen(port, () => {
  console.log(`Listening on Port: ${port}`);
});

//// Yis, yissss, I know I could have used the Google Generative AI NPM Module, but I wanted to learn how to make HTTP requests with axios :'D

//// Errors encounted: GEMINI | 503 - The model is overloaded, please try again later
