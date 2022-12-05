require('dotenv').config();
const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const { API_PORT, MONGO_URI } = process.env;

const port = process.env.API_PORT || API_PORT;
console.log('env port =>', process.env.API_PORT);

// server listening 
server.listen(port, () => {
    console.log(`Server running on port ${port}`, __dirname);
});