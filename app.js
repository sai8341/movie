const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(
        `The Server Started Running at http://localhost:3000/players/`
      );
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET Movies API

const snakeCaseToCamelCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    movieName: dbObject.movie_id,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT * FROM movie`;
  const movies = await db.all(moviesQuery);
  let moviesArray = [];

  for (let m of movies) {
    moviesArray.push(snakeCaseToCamelCase(m));
  }
  response.send(moviesArray);
});

// POST API Call

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movieDetails = `
    INSERT INTO 
        movie
    (director_id, movie_name, lead_actor)

    VALUES
        (${directorId}. '${movieName}', '${leadActor}')
    `;
  const movie = await db.run(snakeCaseToCamelCase(movieDetails));
  response.send("Movie Successfully Added");
});

module.exports = app;
