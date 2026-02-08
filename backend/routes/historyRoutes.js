const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");

router.get("/", historyController.getAllHistory);
router.get("/:id", historyController.getHistoryById);
router.post("/", historyController.saveHistory);
router.delete("/:id", historyController.deleteHistory);
router.delete("/", historyController.clearHistory);

module.exports = router;
