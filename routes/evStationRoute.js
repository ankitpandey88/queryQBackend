const express = require("express");
const {
    createEvStation,
    getAllEvStations,
    getEvStationById,
    updateEvStation,
    deleteEvStation,
    createBaseLocation
} = require("../controllers/evStationController");

const evStationRoute = express.Router();

evStationRoute.post("/create/ev-station", createEvStation);
evStationRoute.get("/get/ev-station", getAllEvStations);
evStationRoute.get("/getEvStationById/:id", getEvStationById);
evStationRoute.put("/updateEvStation/:id", updateEvStation);
evStationRoute.delete("/deleteEvStation/:id", deleteEvStation);

/////////////////////////////////////////////
evStationRoute.post("/createBaseLocation", createBaseLocation);

module.exports = evStationRoute;
