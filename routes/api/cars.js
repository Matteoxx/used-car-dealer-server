const express = require("express");
const router = express.Router();

const db = require("../../queries");

router.get("/cars", db.getAvailableCars);
router.get("/cars/:id", db.getAvailableCarsById);
router.post("/cars/:id/reserve", db.reserveCar);
router.post("/cars/:id/buy", db.buyCar);
router.post("/cars/filter", db.getfilteredCars);
router.post("/auth", db.authenticate);

module.exports = router;
