const express = require("express");
const router = express.Router();

const db = require("../../queries");

router.get("/cars", db.getAvailableCars);
router.post("/cars/filter", db.getfilteredCars);
router.post("/auth", db.authenticate);

module.exports = router;
