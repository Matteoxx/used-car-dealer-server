const { Pool } = require("pg");

const connectionString =
  "postgres://postgres:postgres@localhost/usedcarsdealer";

const pool = new Pool({
  connectionString: connectionString
});

const getCars = (request, response) => {
  pool.query("SELECT * from samochody", (err, res) => {
    if (err) {
      console.error("error fetching data");
    }

    console.log(res.rows);
    pool.end();
  });
  response.send();
};

const getfilteredCars = (request, response) => {
  let query =
    "SELECT * FROM samochody NATURAL JOIN modele_samochodow NATURAL JOIN marki_samochodow WHERE ";

  let strToAdd = "";
  request.body.forEach(elem => {
    if (elem.value === "") {
      return;
    }
    if (elem.type === "=") {
      strToAdd += elem.name + "=" + "'" + elem.value + "' AND ";
    }
    if (elem.type === "between") {
      if (elem.value.from === "" && elem.value.to === "") {
        return;
      }
      strToAdd +=
        elem.name +
        " BETWEEN " +
        elem.value.from +
        " AND " +
        elem.value.to +
        " AND ";
    }
  });
  regexp = /AND\s$/;
  if (regexp.test(strToAdd)) {
    strToAdd = strToAdd.slice(0, strToAdd.length - 4);
  }
  query += strToAdd;
  console.log(query);

  pool.query(query, (err, res) => {
    if (err) {
      console.error("error fetching data");
    }
    pool.end();
  });
  response.json(request.body);
};

module.exports = {
  getCars,
  getfilteredCars
};
