// https-json-server.js
const jsonServer = require("json-server");
const https = require("https");
const fs = require("fs");

const server = jsonServer.create();

const keyFile = "./server.key";
const certFile = "./server.cert";
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 100,
        jwksUri: "https://yellowteam.eu.auth0.com/.well-known/jwks.json",
    }),

    audience: "https://yellow-team-api.secadv",
    issuer: "https://yellowteam.eu.auth0.com/",
    algorithms: ["RS256"],
});

const checkTeamScope = jwtAuthz(['team', 'admin']);
const checkAdminScope = jwtAuthz(['admin']);


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
    res.send(req.oidc.isAuthenticated() ? "You were logged in successfully" : "You are not authorized to view this page, please log in.");
});

server.get("/teamleden", checkJwt, checkTeamScope, (req, res) => {
    res.json({
        teamleden: ["Wiktor", "Stijn", "Joy", "Nikki"]
    });
});
server.get("/gedichtje", checkJwt, checkAdminScope, (req, res) => {
    res.json({
        gedichtje: [
            "Worker bees can leave",
            "Even drones can fly away",
            "The queen is their slave"
        ]
    });
});

server.use(function(err, req, res, next) {
    console.error(err.stack);
    return res.status(err.status).json({ message: err.message });
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