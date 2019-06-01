const { Pool } = require("pg");

const connectionString =
  "postgres://postgres:postgres@localhost/usedcarsdealer";

const pool = new Pool({
  connectionString: connectionString
});

const getCars = (request, response) => {
  pool.query("SELECT * from samochody", (err, res) => {
    if (err) {
      response.status(500).json({ error: "server error" });
    }

    console.log(res.rows);
    pool.end();
  });
  response.status(200).send();
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

  pool.query(query, (err, res) => {
    if (err) {
      response.status(500).json({ error: "server error" });
    }
    pool.end();
  });
  response.status(201).json(request.body);
};

const authenticate = (request, response) => {
  if (!request.body.login || !request.body.passwword) {
    response.status(400).json({ error: "incorrect login or password" });
  }

  let usersData = [];
  let query = "SELECT nazwa_uzytkownika, haslo FROM klienci";
  pool.query(query, (err, res) => {
    if (err) {
      console.error("error fetching data");
    }
    usersData = res.data;
    pool.end();
  });
  usersData.forEach(userData => {
    if (
      userData.login === request.body.login &&
      userData.passwword === request.body.passwword
    ) {
      response.status(200).json({ status: "OK", user: request.body.login });
    }
  });
};

module.exports = {
  getCars,
  getfilteredCars,
  authenticate
};
