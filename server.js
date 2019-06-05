const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const PORT = 5000;

server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true
  })
);

server.use("/api", require("./routes/api/cars"));

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
