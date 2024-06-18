// Should add a 'Showing Results for...' ?

function suggestLocations(suggestion) {
  //// Render autocomplete location suggestions
  const dropdown = document.getElementById("loc-suggest");
  removeDropdown(dropdown);
  let listHTML = "";
  suggestion.forEach((location) => {
    listHTML += `<li>${location}</li>`;
  });
  dropdown.innerHTML = `<ul>${listHTML}</ul>`;

  const listItems = document.querySelectorAll("li");
  console.log(listItems);

  listItems.forEach((item) => {
    console.log(item);
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
const locInput = document.forms["loc-search"]["location"];
const content = document.getElementById("content");

locInput.addEventListener("keyup", async (event) => {
  try {
    //// Query LocationIQ /autocomplete endpoint for location suggestions based on user input
    console.log(locInput.value);
    if (
      locInput.value != "" &&
      (event.code == `Key${event.key.toUpperCase()}` ||
        event.code == "Backspace")
    ) {
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
      suggestLocations(responseData);
    }
  } catch (err) {
    console.log(err);
  }
  // Create event listener on search box that listens for keyboard events and sends contents of search box to server /autocomplete route
  // fetch list of results from server and display as dropdown for users
  // User can then click on result in dropdown and it will populate the search box
  // On clicking on a result or out of the box, the dropdown disappears

  // Note: Still need to do:
  // * CSS (including highlight on hover) - DONE
  // https://www.algolia.com/blog/engineering/how-to-implement-autocomplete-with-javascript-on-your-website/
  // * JS for populating Search box on click and removing search box
  // * JS for removing dropdown if no text in search box or if user clicks out of search box
  // * JS for making dropdown appear if user clicked out of search box and then back in again
  // * JS if user presses backspace, resend query to server
  // * What to do if user clicks search without selecting from dropdown?
});

document.getElementById("search-btn").addEventListener("click", (search) => {
  //// Render loader and transition header to top of page on click of Search button
  console.log(`Searching... ${locInput.value}`);
  //// Check that a location has been input. If not, do nothing (form will prompt user to add an input)
  if (locInput.value != "") {
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
