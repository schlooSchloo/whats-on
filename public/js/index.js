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

//// Return events on for provided location
// async function searchEvents(location) {
//   const response = await fetch(`/search-events?location=${location}`, {
//     method: "POST",
//   });
//   /* Need to finish this */

//   return response;
// }

//// Return weather for required dates
// async function searchWeather(dates) {
//Change to instead send json object with dates
// data = {date_range: dates }
//   const response = await fetch(`/search-weather=${dates}`, {
//     method: "POST",
//   body: JSON.stringify(data);
//   });
//   /* Need to finish this */

//   return response;
// }

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

const head = document.getElementById("header");
const headDivider = document.getElementById("head-divider");
const loader = document.getElementById("loader");
const locSearch = document.getElementById("loc-search");
const content = document.getElementById("content");

document.getElementById("search-btn").addEventListener("click", (search) => {
  //// Render loader and transition header to top of page on click of Search button

  //// Check that a location has been input. If not, do nothing (form will prompt user to add an input)
  const locInput = document.forms["loc-search"]["location"].value;

  if (locInput != "") {
    search.preventDefault();
    // Make space for results and render loader
    head.classList.add("make-space");
    headDivider.classList.remove("hide");
    loader.classList.remove("hide");
    locSearch.classList.remove("col");

    // Delete any previously rendered cards from a previous search
    content.innerHTML = "";

    const dates = getDate();
    console.log(dates);
    const formattedDates = formatDate(dates);
    console.log(formattedDates);

    // renderEvents(formattedDates);
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
