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
        `The Server Started Running at http://localhost:3000/movies/`
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
        (${directorId}, '${movieName}', '${leadActor}')
    `;
  const movie = await db.run(movieDetails);
  response.send("Movie Successfully Added");
});

module.exports = app;

// API call for single movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const player = await db.get(getPlayerQuery);
  response.send(snakeCaseToCamelCase(player));
});

app.put("movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const movie = `
    UPDATE
        movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    `;
  await db.run(movie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleted = `
    DELETE FROM 
        movie
    WHERE
        movie_id = ${movieId};
    `;
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => snakeCaseToCamelCase(eachDirector))
  );
});
