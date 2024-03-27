import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

//Set API Keys from env variables

const response = {
  text: '``` JSON\n{\n  "events": [\n    {\n      "date": "2023-03-04",\n      "title": "Canberra Symphony Orchestra: The Planets",\n      "description": "The Canberra Symphony Orchestra presents a concert featuring Gustav Holst\'s epic orchestral suite, The Planets.",\n      "price": "$69-$129",\n      "link": "https://www.cso.org.au/concerts/the-planets"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "Canberra Writers Festival",\n      "description": "The Canberra Writers Festival is a celebration of literature and ideas, featuring a program of author talks, workshops, and events.",\n      "price": "Varies",\n      "link": "https://canberrawritersfestival.com.au/"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "Floriade: Commonwealth Park",\n      "description": "Floriade is an annual flower festival showcasing over a million blooms in Commonwealth Park.",\n      "price": "Free",\n      "link": "https://www.floriade.com.au/"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "Canberra Raiders vs. Wests Tigers",\n      "description": "The Canberra Raiders take on the Wests Tigers in a NRL match at GIO Stadium.",\n      "price": "$29-$99",\n      "link": "https://www.raiders.com.au/tickets"\n    },\n    {\n      "date": "2023-03-05",\n      "title": "National Folk Festival",\n      "description": "The National Folk Festival is a four-day celebration of folk music, dance, and culture, featuring a program of concerts, workshops, and events.",\n      "price": "$180-$280",\n      "link": "https://www.folkfestival.org.au/"\n    }\n  ]\n}\n```',
}; // Maybe read from files instead on API call? Then can update to be axios api call later.

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

//get '/'
app.get("/", (req, res) => {
  res.render("index.ejs");
});

//on search, animate change in header elements. eg. <hr /> can fade in; search button moves inline with search bar

app.listen(port, () => {
  console.log(`Listening on Port: ${port}`);
});

//// Yes, I know I could have used the Google Generative AI NPM Module, but I wanted to learn how to make HTTP requests with axios :'D

//// Errors encounted: GEMINI | 503 - The model is overloaded, please try again later
