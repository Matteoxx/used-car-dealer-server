const { Pool } = require("pg");
const moment = require("moment");

const connectionString =
  "postgres://postgres:postgres@localhost/usedcarsdealer";

const pool = new Pool({
  connectionString: connectionString
});

const getAvailableCars = (request, response) => {
  let query =
    "SELECT * FROM samochody NATURAL JOIN modele_samochodow NATURAL JOIN marki_samochodow LEFT JOIN rezerwacje USING(id_samochodu) WHERE data_wydania IS NULL AND id_rezerwacji IS NULL";
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

const getAvailableCarsById = (request, response) => {
  let carId = request.params.id;
  let query = `SELECT * FROM samochody NATURAL JOIN modele_samochodow NATURAL JOIN marki_samochodow LEFT JOIN rezerwacje USING(id_samochodu) WHERE data_wydania IS NULL AND id_rezerwacji IS NULL AND samochody.id_samochodu = '${carId}'`;

  pool.query(query, (err, res) => {
    if (err) {
      response.status(500).json({
        error: {
          message: "server error"
        }
      });
    } else {
      response.status(200).send(res.rows[0]);
    }
  });
};

const reserveCar = (request, response) => {
  let currentDate = new Date();
  let date_to = currentDate.setDate(currentDate.getDate() + 7);
  date_to = moment(date_to).format("YYYY-MM-DD");
  let query = `INSERT INTO rezerwacje (data_do, id_klienta, id_samochodu)
  VALUES ('${date_to}', ${request.body.id_klienta} , ${
    request.body.id_samochodu
  })`;

  pool.query(query, (err, res) => {
    if (err) {
      response.status(500).json({
        error: {
          message: "server error"
        }
      });
    } else {
      response.status(201).json({ status: "OK", message: "car reserved" });
    }
  });
};

const buyCar = (request, response) => {
  let currentDate = new Date();
  currentDate = moment(currentDate).format("YYYY-MM-DD");
  let selectFromCars = `SELECT * FROM samochody WHERE id_samochodu = '${
    request.body.carId
  }'`;
  let updateCars = `UPDATE samochody SET data_wydania = '${currentDate}' WHERE id_samochodu =  ${
    request.body.carId
  }`;
  let randomNumber = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
  let invoiceNumber = randomNumber + "/2019";
  let insertToTransactions = `INSERT INTO transakcje (rodzaj_transakcji, kwota, nr_faktury, sposob_zaplaty, data_transakcji, zaplacono, id_klienta, id_samochodu)
  VALUES ('kupno', $1, '${invoiceNumber}', 'przelew', '${currentDate}', 'nie', '${
    request.body.userId
  }', '${request.body.carId}');`;

  (async () => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const { rows } = await client.query(selectFromCars);

      await client.query(updateCars);
      await client.query(insertToTransactions, [rows[0].cena]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  })().catch(e => console.error(e.stack));
};

const getfilteredCars = (request, response) => {
  response.setHeader("Content-Type", "application/json");
  let data = [];
  let query =
    "SELECT * FROM samochody NATURAL JOIN modele_samochodow NATURAL JOIN marki_samochodow LEFT JOIN rezerwacje USING(id_samochodu) WHERE data_wydania IS NULL AND id_rezerwacji IS NULL AND ";

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
  if (!request.body.username || !request.body.password) {
    response.status(400).json({
      error: {
        message: "incorrect login or password"
      }
    });
  }

  let userdata = [];
  let query = `SELECT * FROM klienci WHERE nazwa_uzytkownika = '${
    request.body.username
  }' AND haslo = '${request.body.password}';`;
  pool.query(query, (err, res) => {
    if (err || res.rows.length === 0) {
      response.status(400).json({
        error: {
          message: "incorrect login or password"
        }
      });
    } else {
      userdata = res.rows[0];

      response.status(200).json({
        userId: userdata.id_klienta,
        username: userdata.nazwa_uzytkownika,
        role: "ROLE_USER"
      });
    }
  });
};

module.exports = {
  getAvailableCars,
  getAvailableCarsById,
  getfilteredCars,
  reserveCar,
  buyCar,
  authenticate
};
