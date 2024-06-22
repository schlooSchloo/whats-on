import express from "express";
import axios from "axios";
import "dotenv/config";
import * as fs from "node:fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import { rateLimit } from "express-rate-limit";

const app = express();
const port = 3000;

const autocompleteRateLimit = rateLimit({
  // Limiting autocomplete to 2 requests / sec
  windowMs: 1000, // 1 sec
  limit: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: "You've exceeded your rate limit!",
});

app.set("view engine", "ejs");

//// FUNCTIONS

//// ~~~ FOR DEVELOPMENT - READ IN DUMMY DATA TO AVOID SPAMMING API ENDPOINTS ~~~ ////
/*
// Return dummy data for Latitude and Longitude of Canberra, Australia
async function getLatLong(locationName) {
  return "-35.2975906, 149.1012676";
}

// Read dummy data for use in /search-weather route
async function getWeather(latlong) {
  try {
    const res = await fs.readFile(
      __dirname + "/dummy-data/dummy-weather-response.json"
    );

    return JSON.parse(res);
    //
  } catch (err) {
    console.log(err);
  }
}

// Read dummy data for use in /search-events route
// Note: Need to change const eventList in function parseWeather() to:
// const eventList = JSON.parse(
//   // Get array of events returned in eventResponse
//   JSON.parse(eventResponse).candidates[0].content.parts[0].text.replace(
//     /(```json|```|\n)/gi,
//     ""
//   )).events
async function getEvents(locationName) {
  const eventResponse = await fs.readFile(
    path.join(
      dirname(fileURLToPath(import.meta.url)),
      "/dummy-data/dummy-event-response.json"
    )
  );

  return eventResponse;
}
*/
//// ~~~ END DUMMY FUNCTIONS ~~~ ////

async function getLatLong(locationName) {
  //// Get Longitude and Latitude of Location entered by user
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
    //
  } catch (err) {
    // console.log(err);
    if (err.name == "AxiosError") {
      const errMsg = `${err.name}: ${err.message}\n${err.response.statusText} - ${err.response.data.error}`;
      console.log(errMsg);
    }
  }
}

async function getWeather(latlong) {
  //// Get weather forecast from tomorrow.io API
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
    //
  } catch (err) {
    // console.log(err);
    if (err.name == "AxiosError") {
      const errMsg = `${err.name}: ${err.message}\n${err.response.statusText} - ${err.response.data.error}`;
      console.log(errMsg);
    }
  }
}

async function getEvents(locationName) {
  //// Get list of events from Gemini API
  try {
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `What events are on in or within 20km of ${locationName} this Saturday and Sunday? Include date in yyyy-mm-dd format as 'date', event name as 'name', time of event (in am/pm format) as 'time', event location as 'location', a short description of the event as 'description, the price (or range of prices) of the event as 'price', and a link to the event website as 'link'. Provide 3 events for each day. Provide response in JSON format with events ordered by date ascending`,
            },
          ],
        },
      ],
    };

    const eventResponse = await axios.post(
      process.env.GEMINI_GENERATE_CONTENT_API_URL,
      prompt,
      {
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    return eventResponse.data;
    //
  } catch (err) {
    console.log(err);
  }
}

function parseWeather(userDates, forecast, filePathList) {
  //// Extract Temperature Forecast and Weather Code from tomorrow.io response, for required dates
  let weather = {};
  weather.daily = [];

  const forecastDates = forecast.timelines.daily;

  // Convert userDates to 10char string in format YYYY-MM-DD
  userDates.forEach((date) => {
    const stringUserDate = `${date.getFullYear()}-${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;

    // Compare userDates against dates in response from tomorrow.io to get respective 'temp'
    // and 'weather code'
    for (let i = 0; i < forecastDates.length; i++) {
      if (stringUserDate == forecastDates[i].time.slice(0, 10)) {
        const weatherIconPath = getWeatherIcon(
          forecastDates[i].values.weatherCodeMax,
          filePathList
        );

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
  //// Return the file path for the correct weather icon
  try {
    let iconPath = "";
    const weatherCodeDay = weatherCode * 10;
    // Day icon has 0 appended at end of weatherCode (1 for night)

    filePathList.forEach((path) => {
      if (path.slice(0, 5) == weatherCodeDay && path.slice(-7) == "@2x.png") {
        iconPath = path;
      }
    });

    return iconPath;
    //
  } catch (err) {
    console.log(err.name, err.message);
  }
}

function parseEvents(userDates, eventResponse) {
  try {
    // console.log(eventResponse);

    // Get array of events returned in eventResponse

    const eventListText = eventResponse.candidates[0].content.parts[0].text;
    // console.log(eventListText);
    const eventList = JSON.parse(
      eventListText.replace(/(```json|```JSON|JSON|json|```|\n)/gi, "")
    ).events;

    // NOTE (FOR DEV WORK): When using Dummy getweather() use:
    /*
    const eventList = JSON.parse(
      // Get array of events returned in eventResponse
      JSON.parse(eventResponse).candidates[0].content.parts[0].text.replace(
        /(```json|```|\n)/gi,
        ""
      )
    ).events;
    */

    // Because Gemini Model returns old dates, re-map returned dates to user dates
    const satDate = eventList[0].date;
    const sunDate = eventList[eventList.length - 1].date;

    eventList.forEach((event) => {
      switch (event.date) {
        case satDate:
          event.date = `${userDates[0].getFullYear()}-${(
            "0" +
            (userDates[0].getMonth() + 1)
          ).slice(-2)}-${("0" + userDates[0].getDate()).slice(-2)}`;
          break;
        case sunDate:
          event.date = `${userDates[1].getFullYear()}-${(
            "0" +
            (userDates[1].getMonth() + 1)
          ).slice(-2)}-${("0" + userDates[1].getDate()).slice(-2)}`;
          break;
        default:
          event.date = "";
          break;
      }
    });

    return eventList;
    //
  } catch (err) {
    console.log(err);
  }
}

//// MIDDLEWARE
app.use(express.static("public"));

app.use(express.json());

//// ROUTES
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/autocomplete", autocompleteRateLimit, async (req, res) => {
  // Get location suggestions
  // Going to run autocomplete via server to protect API keys. May result in latency though :'(
  // If live on a domain, would use http referrer restriction
  try {
    const locSearch = req.query.q;
    console.log(locSearch);

    const apiResponse = await axios.get(
      process.env.LOCATION_IQ_AUTOCOMPLETE_API_URL,
      {
        params: {
          key: process.env.LOCATION_IQ_API_KEY,
          q: locSearch,
          limit: 3,
          // normalizecity: 1,
        },
      }
    );

    // Only return basic contextual information regarding location as an array
    let response = [];

    apiResponse.data.forEach((location) => {
      if (location.address.state) {
        response.push(
          `${location.address.name}, ${location.address.state}, ${location.address.country}`
        );
      } else {
        response.push(`${location.address.name}, ${location.address.country}`);
      }
    });

    /*
    response = [
      "Canberra, Australian Capital Territory, Australia",
      "Canby, Minnesota, United States of America",
      "Canberra Airport, Australian Capital Territory, Australia",
    ];
    */

    res.status(200).send(JSON.stringify(response));
    //
  } catch (err) {
    console.log(err);

    if (err.name == "AxiosError") {
      const errMsg = `${err.name}: ${err.message}\n${err.response.statusText} - ${err.response.data.error}`;
      res.status(err.response.status).send(errMsg);
    } else {
      res.status(500).send(err);
    }
  }
});

app.post("/search-events", async (req, res) => {
  // Get event list
  try {
    const userLocationName = req.body.location_name;
    const userDates = [
      new Date(req.body.date_range[0]),
      new Date(req.body.date_range[1]),
    ];

    const eventResponse = await getEvents(userLocationName);

    const eventList = parseEvents(userDates, eventResponse);

    res.status(200).send(eventList);
    //
  } catch (err) {
    console.log(err);
  }
});

app.post("/search-weather", async (req, res) => {
  // Get weather
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const userLocationName = req.body.location_name;
    const userDates = [
      new Date(req.body.date_range[0]),
      new Date(req.body.date_range[1]),
    ];

    const weatherIconPathList = await fs.readdir(
      path.join(__dirname, "/public/images/weather-icons/png")
    );

    // Geocode Location input by user
    const latLong = await getLatLong(userLocationName);
    console.log(`Location Received: ${userLocationName}`);
    console.log(`Location Coordinates Received: ${latLong}`);

    // Get 5-day weather forecast from tomorrow.io
    const weatherResponse = await getWeather(latLong);

    // Compare user's dates to weatherResponse dates to find the respective forecasts
    const weather = parseWeather(
      userDates,
      weatherResponse,
      weatherIconPathList
    );

    res.status(200).send(JSON.stringify(weather));
    //
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Listening on Port: ${port}`);
});

//// Errors encounted: GEMINI | 503 - The model is overloaded, please try again later
