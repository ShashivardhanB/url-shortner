const express = require('express');
// The express.Router () function is used to create a new router object. This function is used when you want to create a new router object in your program to handle requests
const router = express.Router();
const urlController = require('../controller/urlController')



router.post("/url/shorten",urlController.createShortUrl )

router.get("/:urlCode",urlController.originalUrl )

module.exports = router

