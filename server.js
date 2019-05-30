const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const PORT = 5000;
// const { Pool, Client } = require("pg");

// const connectionString =
//   "postgres://postgres:postgres@localhost/usedcarsdealer";

// const pool = new Pool({
//   connectionString: connectionString
// });

server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// server.get("/", function(req, res) {
//   pool.query("SELECT * from samochody", (err, res) => {
//     console.log(err, res);
//     pool.end();
//   });
// });

server.use("/api", require("./routes/api/cars"));

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
