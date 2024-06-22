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

  const formattedDates = [
    {
      date: `${dates[0].getFullYear()}-${(
        "0" +
        (dates[0].getMonth() + 1)
      ).slice(-2)}-${("0" + dates[0].getDate()).slice(-2)}`,
      formatted: `${days[dates[0].getDay()]}, ${dates[0].getDate()}-${
        months[dates[0].getMonth()]
      }`,
    },
    {
      date: `${dates[1].getFullYear()}-${(
        "0" +
        (dates[1].getMonth() + 1)
      ).slice(-2)}-${("0" + dates[1].getDate()).slice(-2)}`,
      formatted: `${days[dates[1].getDay()]}, ${dates[1].getDate()}-${
        months[dates[1].getMonth()]
      }`,
    },
  ];

  return formattedDates;
  //
}

async function fetchWeather(data) {
  //// Fetch forecast weather for selected dates
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
  //// Fetch upcoming events for selected dates
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

function renderEvents(formattedDates, weather, eventList) {
  console.log(`renderEvents called with dates ${formattedDates} `);
  let i = 0;
  formattedDates.forEach((userDate) => {
    const eventDate = document.createElement("div");
    weather.daily.forEach((forecast) => {
      if (userDate.date == forecast.date) {
        eventDate.innerHTML = `
        <div class="date flex wrap g20">
          <h2 class="event-date">${userDate.formatted}</h2>
          <div class="weather flex align-centre g10">
            <img
              class="weather-icon"
              src="images/weather-icons/png/${forecast.weather_icon_path}"
              alt="weather icon"
            />
            <h2 class="temp">${forecast.temperatureMax_degC}&degC</h2>
          </div>
        </div>
        <div id=cards${i} class="cards grid g20">
        </div>
        `;
        content.appendChild(eventDate);

        let a = 0; // Using 'a' and 'i' to set animation order
        const eventCard = document.getElementById(`cards${i}`);

        eventList.forEach((event) => {
          if (userDate.date == event.date) {
            eventCard.innerHTML += `
              <a href=${event.link} target="_blank">
                <div
                  class="card response flex col align-centre space-between"
                  style="--animation-order: ${(a + 1) * (i + 1)}"
                >
                  <div class="card img">
                    <!--Couldn't get Gemini to provide real image URLs, could instead have 'category' images that are rendered based on what category Gemini gives the event (e.g. 'Sport')-->
                    <img src="images/placeholder-img.jpg" alt="event image" />
                  </div>
                  <h3> ${event.name} </h3>
                  <div class="event-details grid col-g10">
                    <p data-variant="title">Time</p>
                    <p>${event.time}</p>
                    <p data-variant="title">Price</p>
                    <p>${event.price}</p>
                    <p data-variant="title">Location</p>
                    <p>${event.location}</p>
                  </div>
                  <p class="event-desc">
                    ${event.description}
                  </p>

                  <button
                    class="learn-more button flex row justify-centre align-centre g10"
                    type="button"
                  >
                    <img src="images/external-link-icon.svg" alt="external link" />
                    <h3 data-variant="white">Learn More</h3>
                  </button>
                </div>
              </a>            
            `;

            a++;
          }
        });

        content.appendChild(eventCard);
        i++;
      }
    });
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
  //// Remove dropdown when user clicks out of the Search box
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
      // Check that a valid location has been input.
      if (locInput.value != "" && suggestedLoc.includes(locInput.value)) {
        search.preventDefault();

        // Delete any previously rendered cards from a previous search
        content.innerHTML = "";

        // Make space for results and render loader
        head.classList.add("make-space");
        headDivider.classList.remove("hide");
        loader.classList.remove("hide");
        locSearch.classList.remove("col");

        // Get dates for the upcoming weekend
        const dates = getDate();
        const formattedDates = formatDate(dates);

        // Fetch weather and event data from APIs
        const data = {
          date_range: dates,
          location_name: locInput.value,
        };
        console.log(`Sending data: ${data.location_name}`);
        const weather = await fetchWeather(data);
        console.log(`Weather: ${JSON.stringify(weather)}`);

        const eventList = await fetchEvents(data);
        console.log(`Events: ${JSON.stringify(eventList)}`);

        // Render data
        renderEvents(formattedDates, weather, eventList);

        loader.classList.add("hide");
        content.classList.remove("hide");
        //
      } else {
        search.preventDefault();
        // Maybe add something to tell the user to select from the dropdown
      }
      //
    } catch (err) {
      console.log(err);
    }
  });
