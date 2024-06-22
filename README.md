# Overview

I'm not much of a planner, and when the weekend rolls around it's always a mad flurry flicking between a questionable number of tabs and liasing with friends to figure out what's actually on this weekend. This is admin I honestly don't care much for. Surely there's an easier way!

What's **ON** seeks to take all the admin and FOMO out of searching for the best upcoming events and activities by aggregating and summarising all these events into one place.

## Limitations

This Project is only intended as a Proof of Concept, and has been created solely to help me in learning web development languages. In short **this project won't give you the answers you're looking for!** 💔

It sends requests to a Development Instance of Gemini that doesn't have access to real-time information, the free access to the tomorrow.io API only allows forecasts 5 days in advance, and I haven't incorporated any logic to cater for timezone differences against UTC in the forecasts returned.

In its current state this project is just for show, but if I get some positive feedback around the problem its trying to solve then I might look at uplifting it to work properly (including using paid API services for up-to-date info 😅)

# Installation

## API Keys

This project makes calls to 3 different APIs, which you'll need to generate your own keys for. All API Keys are free (with some limitation in terms of rate limits and available services)

### LocationIQ

LocationIQ is used to provide location suggestions when the user is typing in their location, and to then convert the location into longitude and latitude.

To generate an API key, head to [locationiq.com](https://locationiq.com/).

Rate Limit: 2 requests / sec; 60 requests / min; 5000 requests / day

### Tomorrow.io

Tomorrow.io is used to provide weather forecasts based on given coordinates.

To generate an API key, head to [tomorrow.io](https://www.tomorrow.io/).

Rate Limit: 3 requests / sec; 25 requests / hour; 500 requests / day

### Gemini

Gemini does the heavy lifting (thanks Google! 😍), searching for and summarising events for the user's location.

To generate an API key, head to [Google AI Studio](https://aistudio.google.com/).

Remember, this key will only give you access to a Development Instance of Gemini - it doesn't have access to real-time information. Plus, Generative AIs are known to provide hallucinations at times (incorrect or misleading results), and Gemini is no exception - I've witnessed it firsthand!

**TO DO - Add Rate Limit for Gemini**

## Getting the Project Running

What's **ON** requires Node.js to run.

## Add Your Keys to .env

Rename '.env.example' to '.env' and your keys to the file.

## Install Dependencies and Run!

Install the dependencies and start the server

```sh
npm i
node index.js
```

# How it Works

What's **ON** is a website that runs locally on the user's machine via Port 3000. The user can access the website by heading to <http://localhost:3000/> in their browser.

From the website, the user can search a location for events coming up in that location for that weekend (Saturday and Sunday). These will appear in cards below the prompt. The user can then click on a card to be redirected to the event website for more information and to purchase tickets.

Due to some delay in response on some API calls, a loading screen is rendered while the user

### API Usage

1. During searching for a location, the website makes calls to the LocationIQ /autocomplete endpoint to provide location suggestions to the user.
2. When the user clicks the 'Search' button, the website then calls the LocationIQ /search endpoint to geocode the location to longitude and latitude.
3. Long/Lat Coordinates are then used to call the tomorrow.io /forecast endpoint to get a 5 day weather forecast.
4. The inputed location is added to a predefined text prompt and sent to Gemini to return a short list of events coming up for the next weekend.

### Rate Limiting

I've only added a rate limiter to the /autocomplete route (of 2 requests / s) which fetches location suggestions from LocationIQ based on User Input

# What the Future Could Look Like 🤖

- Additional Search Options (Dates, Interests, Price)
- Save and Share Events
- Recommend events based on interests, or that are similar to one attended
