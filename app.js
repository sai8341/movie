const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API for getting movie names

app.get("/movies/", async (request, response) => {
  const allMovies = `
  SELECT
    *
   FROM 
    movie`;
  const moviesArray = await db.all(allMovies);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const movieQuery = `
  INSERT INTO 
    movie (director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');
  `;
  const postMovie = await db.run(movieQuery);
  const movieId = postMovie.lastID;
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updatingDetails = `
  UPDATE 
    movie
  SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  
  WHERE 
    movie_id = ${movieId};
  `;

  const movieDetails = await db.run(updatingDetails);
  response.send("Movie Details Updated");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT
    *
  FROM
    movie
  WHERE
    movie_id = ${movieId}
  `;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId};
    `;
  const del = await db.run(deleteQuery);
  response.send("Movie Removed");
});
module.exports = app;

app.get("/directors/", async (request, response) => {
  const directorQuery = `
    SELECT 
        * 
    FROM 
        director
    `;
  const directors = await db.all(directorQuery);
  response.send(
    directors.map((eachDirectors) =>
      convertDirectorDbObjectToResponseObject(eachDirectors)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(directorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
