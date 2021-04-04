// https-json-server.js
const jsonServer = require("json-server");
const https = require("https");
const fs = require("fs");

const server = jsonServer.create();

const keyFile = "./server.key";
const certFile = "./server.cert";

const { auth } = require("express-openid-connect");

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: "whNkoY8X6EcAESJeYE15GasIjCcDy9f9cZDehMmyzrYm5vFx9eTOXxwJIXLxHuw-",
    baseURL: "https://localhost:3000/",
    clientID: "P2uDFCZwChJClclcq2iaiwaGnX3KyLOY",
    issuerBaseURL: "https://yellowteam.eu.auth0.com",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use(auth(config));

// req.isAuthenticated is provided from the auth router
server.get("/", (req, res) => {
    res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

server.get("/teamleden", (req, res) => {
    console.log(req, res);
    res.send(
        req.oidc.isAuthenticated() ? ["Wiktor", "Stijn", "Joy", "Nikki"] : "Not authorized, please log in");
});
server.get("/gedichtje", (req, res) => {
    res.send(
        req.oidc.isAuthenticated() ? [
            "Worker bees can leave",
            "Even drones can fly away",
            "The queen is their slave"
        ] : "Not authorized, please log in"
    );
});

https
    .createServer({
            key: fs.readFileSync(keyFile),
            cert: fs.readFileSync(certFile),
        },
        server
    )
    .listen(3000, () => {
        console.log("Go to https://localhost:3000/teamleden");
        console.log("Or to https://localhost:3000/gedichtje");
    });