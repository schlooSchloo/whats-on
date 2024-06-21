//// FUNCTIONS

async function fetchLocations() {
  //// Fetch locations suggestions from /autocomplete route
  const response = await fetch(`/autocomplete?q=${locInput.value}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(
      `Bad Network Response: ${response.status} - ${response.statusText}`
    );
  }
  console.log(response);
  const responseData = await response.json();
  return responseData;
}

function suggestLocations(suggestion) {
  //// Render autocomplete location suggestions

  let listHTML = "";
  suggestion.forEach((location) => {
    listHTML += `<li>${location}</li>`;
  });
  dropdown.innerHTML = `<ul>${listHTML}</ul>`;

  const listItems = document.querySelectorAll("li");
  listItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      locInput.value = this.innerHTML;
      removeDropdown(dropdown);
    });
  });
}

function removeDropdown(dropdownDOM) {
  dropdownDOM.innerHTML = "";
}

//// Return the dates for the upcoming weekend
function getDate() {
  const today = new Date();
  const sundayDay = today.getDate() - (today.getDay() - 1) + 6;
  const saturdayDay = sundayDay - 1;

  return [
    new Date(today.setDate(saturdayDay)),
    new Date(today.setDate(sundayDay)),
  ];
}

//// Return the dates for the upcoming weekend in the required format to be rendered by the webpage
function formatDate(dates) {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  return [
    `${days[dates[0].getDay()]}, ${dates[0].getDate()}-${
      months[dates[0].getMonth()]
    }`,
    `${days[dates[1].getDay()]}, ${dates[1].getDate()}-${
      months[dates[1].getMonth()]
    }`,
  ];
}

async function fetchWeather(data) {
  try {
    const weatherResponse = await fetch("/search-weather", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!weatherResponse.ok) {
      throw new Error(
        `Bad Network Response: ${weatherResponse.status} - ${weatherResponse.statusText}`
      );
    }

    const weather = await weatherResponse.json();

    return weather;
    //
  } catch (err) {
    console.log(err);
  }
}

async function fetchEvents(data) {
  try {
    const eventsResponse = await fetch("/search-events", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!eventsResponse.ok) {
      throw new Error(
        `Bad Network Response: ${eventsResponse.status} - ${eventsResponse.statusText}`
      );
    }

    const eventsList = await eventsResponse.json();

    return eventsList;
    //
  } catch (err) {
    console.log(err);
  }
}

function renderEvents(formattedDates) {
  console.log(`renderEvents called with dates ${formattedDates} `);
  formattedDates.forEach((date) => {
    const eventDate = document.createElement("div");
    eventDate.innerHTML = `
      <div class="date flex wrap g20">
        <h2 class="event-date">${date}</h2>
        <div class="weather flex align-centre g10">
          <img
            class="weather-icon"
            src="images/weather-icons/png/10000_clear_small@2x.png"
            alt="weather icon"
          />
          <h2 class="temp">32&degC</h2>
        </div>
      </div>`;
    content.appendChild(eventDate);
    // Then do a forEach on Events, matching on eventDates.getDay() (Because the events data is from last year and a different month)
    // and append to child
  });
}

//// GLOBAL DECLARATIONS
const head = document.getElementById("header");
const headDivider = document.getElementById("head-divider");
const loader = document.getElementById("loader");
const locSearch = document.getElementById("loc-search");
const locInput = document.forms["loc-search"]["location"];
const dropdown = document.getElementById("loc-suggest");
const content = document.getElementById("content");
let suggestedLoc = [];

//// EVENT LISTENERS
locInput.addEventListener("keyup", async (event) => {
  try {
    //// Query LocationIQ /autocomplete endpoint for location suggestions based on user input
    console.log(locInput.value);

    if (
      locInput.value != "" &&
      (event.code == `Key${event.key.toUpperCase()}` ||
        event.code == "Backspace")
    ) {
      suggestedLoc = await fetchLocations();
      suggestLocations(suggestedLoc);
    }
    if (locInput.value == "") {
      removeDropdown(dropdown);
    }
    //
  } catch (err) {
    console.log(err);
  }
});

document.addEventListener("click", () => {
  if (document.activeElement != "input") {
    removeDropdown(dropdown);
  }
  //
});

locInput.addEventListener("click", async () => {
  //// Render dropdown when user clicks on input field (and text is present)
  if (locInput.value != "") {
    const responseData = await fetchLocations();
    suggestLocations(responseData);
  }
  //
});

document
  .getElementById("search-btn")
  .addEventListener("click", async (search) => {
    //// Render loader and transition header to top of page on click of Search button
    try {
      //// Check that a valid location has been input.
      if (locInput.value != "" && suggestedLoc.includes(locInput.value)) {
        search.preventDefault();

        // Make space for results and render loader
        head.classList.add("make-space");
        headDivider.classList.remove("hide");
        loader.classList.remove("hide");
        locSearch.classList.remove("col");

        // Delete any previously rendered cards from a previous search
        content.innerHTML = "";

        // Get dates for the upcoming weekend
        const dates = getDate();
        console.log(dates);
        const formattedDates = formatDate(dates);
        console.log(formattedDates);

        // Fetch weather and event data from APIs
        const data = {
          date_range: dates,
          location_name: locInput.value,
        };

        const weather = await fetchWeather(data);
        console.log(`Weather: ${JSON.stringify(weather)}`);

        const eventList = await fetchEvents(data);
        console.log(`Events: ${JSON.stringify(eventList)}`);

        // Render data
        // renderEvents(formattedDates);
        //
      } else {
        search.preventDefault();
        // Maybe add something to tell the user to select from the dropdown
      }
      //
    } catch (err) {
      console.log(err);
    }
    /* 
  * IF (there's text in the input field and it's a valid location) {
      * Delete all cards in #content section (e.g. if user searches another location)
      * Render loader and shift search bar up to top of page
      * Get dates for this weekend
      * Send POST fetch request to "/search" route with location and dates
      * Wait for response
    } ELSE {
      * Prompt user to add a location
    }
*/
  });
