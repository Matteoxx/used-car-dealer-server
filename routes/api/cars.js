const express = require("express");
const router = express.Router();

const db = require("../../queries");

router.get("/cars", db.getCars);
router.post("/cars/filter", db.getfilteredCars);

module.exports = router;
