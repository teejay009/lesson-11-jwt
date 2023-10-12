const usersDB = {
    users:require('../model/users.json'),
    setUsers: function (data) {this.users = data;},
}

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config();
const fsPromise = require("fs").promises
const path = require("path") 

const handleLogin = async (req, res) => {
    const {user, pwd} = req.body
    if(!user || !pwd) return res.status(400).json({"message": "invalid username and password"})
    const foundUser = usersDB.users.find(person => person.username === user)
if(!foundUser) return res.sendStatus (401) // unauthorize

// evaluate password

const match = await bcrypt.compare(pwd, foundUser.password)
    if(match) {
        // create jwt
        const accessToken = jwt.sign(
            {"username":foundUser.username},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: "60s"}
        )

        const refreshToken = jwt.sign(
            {"username":foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: "1d"}
        )

        //saving the refresh token with current user

        const otherUsres = usersDB.users.filter(person => person.username !== foundUser.username)
        const currentUser = {...foundUser,refreshToken} 
        usersDB.setUsers([...otherUsres, currentUser]);
        await fsPromise.writeFile(
            path.join(__dirname, "..", "model", "users.json"),
            JSON.stringify(usersDB.users)
        )
        res.cookie("jwt", refreshToken, {httpOnly : true, maxAge : 24 * 60 * 60 * 1000});

        res.json({accessToken})
    }else{
        res.sendStatus(401)
    }
}

module.exports = {handleLogin}