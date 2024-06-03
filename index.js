import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import "dotenv/config";
// for dummy data - delete when using APIs
import * as fs from "node:fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
// End stuff for dummy data

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

//// Get weather forecast from tomorrow.io API
async function getWeather() {
  try {
    console.log(req.query.location); //// NEED TO GET GEOCODE FIRST THEN CALL THIS FUNCTION WITH THE GEOCODE
    const apiResponse = await axios.get(
      process.env.TOMORROW_IO_FORECAST_API_URL,
      {
        params: {
          location: req.query.location,
          timesteps: "1d",
          units: "metric",
          apikey: process.env.TOMORROW_IO_API_KEY,
        },
      }
    );

    res.status(200).send(JSON.stringify(apiResponse.data));
  } catch (err) {
    console.log(err);
    res.status(404).send(err.message);
  }
}

//// Extract Temperature Forecast and Weather Code from tomorrow.io response, for required dates
function parseWeather(userDates, forecast) {
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
        // add funtion that finds weather code's respective weather-icon name to add to the JSON object
        const dateMatch = {
          date: stringUserDate,
          temperatureMax_degC:
            forecastDates[i].values.temperatureMax.toFixed(1), //round to 1dp
          weather_code: forecastDates[i].values.weatherCodeMax.toString(),
        };
        weather.daily.push(dateMatch);
      }
    }
  });
  return weather;
}

//// MIDDLEWARE
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    const userDates = [
      new Date(req.body.date_range[0]),
      new Date(req.body.date_range[1]),
    ];

    //// Get 5-day weather forecast from tomorrow.io
    const weatherResponse = await readWeather(); // fake API request (reads dummy data)

    //// Compare user's dates to weatherResponse dates to find the respective forecasts
    const weather = parseWeather(userDates, weatherResponse);

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
