// require('dotenv').config({ path: __dirname + '/.env' });
require("./config/database").connect();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const envData = process.env;

app.use(express.json());

// importing user context
const User = require("./model/user");

// Register
app.post("/register", async(req, res) => {

    console.log(req.body);
    // Our register logic
    try {
        // Get user input
        const { firstName, lastName, email, password } = req.body;

        // Validate user input
        if (!(email && password && firstName && lastName)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedUserPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            email: email.toLowerCase(), // sanitize
            password: encryptedUserPassword,
        });

        // Create token
        const token = jwt.sign({ user_id: user._id, email },
            process.env.TOKEN_KEY, {
                expiresIn: "12h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends
});


// Login
app.post("/login", async(req, res) => {

    console.log('I am Login', envData.TOKEN_KEY);
    // Our login logic starts here
    try {
        // Get user input
        const { email, password } = req.body;
        console.log('process.env', process.env.TOKEN_KEY);
        console.log(req.body);
        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign({ user_id: user._id, email },
                process.env.TOKEN_KEY, {
                    expiresIn: "10h",
                }
            );

            // save user token
            user.token = token;

            // user
            return res.status(200).json(user);
        }
        return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }

});

const auth = require("./middleware/auth");

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome to new website!🙌");
});

module.exports = app;