
const express = require('express');
const router = express.Router();
const urlController = require('../controller/urlController')



router.post("/url/shorten",urlController.createShortUrl )

router.get("/:urlCode",urlController.originalUrl )

module.exports = router

