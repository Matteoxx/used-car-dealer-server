const { Pool } = require("pg");

const connectionString =
  "postgres://postgres:postgres@localhost/usedcarsdealer";

const pool = new Pool({
  connectionString: connectionString
});

const getAvailableCars = (request, response) => {
  let query =
    "SELECT * FROM samochody NATURAL JOIN modele_samochodow NATURAL JOIN marki_samochodow WHERE samochody.data_wydania IS NULL";
  let data = [];

  pool.query(query, (err, res) => {
    if (err) {
      response.status(500).json({
        error: {
          message: "server error"
        }
      });
    } else {
      res.rows.forEach(row => data.push(row));
      response.status(200).send(data);
    }
  });
};

const getfilteredCars = (request, response) => {
  response.setHeader("Content-Type", "application/json");
  let data = [];
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

      if (elem.value.from === "") {
        elem.value.from = 0;
      }

      if (elem.value.to === "") {
        elem.value.to = 999999999;
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
      response.status(500).json({
        error: {
          message: "server error"
        }
      });
    } else {
      res.rows.forEach(row => data.push(row));
      response.status(200).send(data);
    }
  });
};

const authenticate = (request, response) => {
  if (!request.body.login || !request.body.passwword) {
    response.status(400).json({
      error: {
        message: "incorrect login or password"
      }
    });
  }

  let usersData = [];
  let query = "SELECT nazwa_uzytkownika, haslo FROM klienci";
  pool.query(query, (err, res) => {
    if (err) {
      response.status(400).json({
        error: {
          message: "incorrect login or password"
        }
      });
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
  getAvailableCars,
  getfilteredCars,
  authenticate
};
