const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "healthy",
    service: "Digital Account Opening API",
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  });
});

module.exports = router;
