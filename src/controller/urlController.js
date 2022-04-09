
const urlModel = require("../models/urlModel")
const shortid = require("shortid");
const redis = require("redis");
const { promisify } = require("util")


const urlReg = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
// ------------------------------------------------------------------------------------------------------------------

const redisClient = redis.createClient(
    11826,
    "redis-11826.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("eZihcVKVefVZj7J7gYZADiJYJE8Kubal", function (err) {
    if (err) throw err;
});
redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

// ---------------------------------------------------------------------------------------------------------------------
const createShortUrl = async function (req, res) {
    try {
        const requestBody = req.body

        const { longUrl } = requestBody

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "please provide input via body" })
        }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "please provide long url" })
        }

        if (!urlReg.test(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "please enter valid url " })
        }

        // checking that longUrl is already shortner
        const isUrlAlreadyShorten = await urlModel.findOne({ longUrl: longUrl }).select({ __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })

        if (isUrlAlreadyShorten) {
            await SET_ASYNC(`${isUrlAlreadyShorten.urlCode}`, JSON.stringify(isUrlAlreadyShorten.longUrl))      

            return res.status(200).send({ status: true, data: isUrlAlreadyShorten })
        }

        requestBody["urlCode"] = shortid.generate().toLowerCase()

        requestBody["shortUrl"] = `http://localhost:3000/${requestBody.urlCode}`            

        const SavedUrl = await urlModel.create(requestBody)

        await SET_ASYNC(`${requestBody.urlCode}`, JSON.stringify(requestBody.longUrl))

        return res.status(201).send({
            status: true, data: {
                "longUrl": SavedUrl.longUrl,
                "shortUrl": SavedUrl.shortUrl,
                "urlCode": SavedUrl.urlCode
            }
        })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//---------------------------------------------------------------------------------------------------------------------------

const originalUrl = async function (req, res) {
    try {

        const urlCode = req.params.urlCode

        if (!isValid(urlCode)) {
            return res.status(400).send({ status: false, message: "please provide urlcode" })
        }
        const cahcedOrginalUrl = await GET_ASYNC(`${urlCode}`)
        if (cahcedOrginalUrl) {
            let redirectingData = JSON.parse(cahcedOrginalUrl)

            console.log("data from cachee")

            return res.status(302).redirect(redirectingData)
        } else {
            const urlData = await urlModel.findOne({ urlCode: urlCode })
            if (!urlData) {
                return res.status(404).send({ status: false, message: "url not found" })
            }
            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData.longUrl))
            console.log("data from db")
            return res.status(302).redirect(urlData.longUrl)
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createShortUrl, originalUrl }


