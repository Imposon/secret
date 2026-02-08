const express = require("express");
const router = express.Router();
const dbController = require("../controllers/dbController");

router.get("/databases", dbController.getDatabases);
router.get("/columns/:db/:table", dbController.getColumns);
router.post("/query", dbController.executeQuery);

module.exports = router;
