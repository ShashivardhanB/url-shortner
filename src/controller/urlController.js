
const urlModel = require("../models/urlModel")
const shortid = require("shortid");
const redis = require("redis");
const { promisify } = require("util")


const urlReg = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
// -----------------------------------------------------------------------------------------------------

const redisClient =  redis.createClient(
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
  



//1. connect to the server
//2. use the commands :

//Connection setup for redis

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

        requestBody["urlCode"] = shortid.generate().toLowerCase()

        requestBody["shortUrl"] = `http://localhost:3000/${requestBody.urlCode}`

        const isUrlAlreadyShorten = await urlModel.findOne({ longUrl: longUrl }).select({ __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })
        if (isUrlAlreadyShorten) {
            return res.status(200).send({ status: true, data: isUrlAlreadyShorten })
        }


        const SavedUrl = await urlModel.create(requestBody)
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
       const  cahcedOrginalUrl = await GET_ASYNC(`${urlCode}`)
        if(cahcedOrginalUrl){
          let  cahcedOrginalUrltoObject = JSON.parse(cahcedOrginalUrl)
            return res.status(302).redirect(cahcedOrginalUrltoObject.longUrl)
        }else{
        const urlData = await urlModel.findOne({ urlCode: urlCode })
        if (!urlData) {
            return res.status(404).send({ status: false, message: "url not found" })
        }
        await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData))
        return res.status(302).redirect(urlData.longUrl)
    }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createShortUrl, originalUrl }


