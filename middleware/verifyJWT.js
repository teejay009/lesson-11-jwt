const jwt = require('jsonwebtoken')
require ("dotenv").config

const verifyJWT = (req, res) => {
    const autHeader = req.autHeader['authorize']
    if(!autHeader) return res.sendStatus(401)
    console.log(autHeader);
const token = autHeader.split("")[1]
jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403) // invalid token
        req.user = decoded.username
        nextDay()
    }
)
}
module.exports = verifyJWT