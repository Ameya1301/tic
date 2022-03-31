import { Server } from "colyseus"
import {Game, Tictactoe} from "./rooms/tictactoe";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";
import express from "express";
import { createServer } from "http";
const basicAuthMiddleware = basicAuth({
    // list of users and passwords
    users: {
        "admin": "admin",
    },
    // sends WWW-Authenticate header, which will prompt the user to fill
    // credentials in
    challenge: true
});

const app = express();
app.use(express.json());

const gameServer = new Server({
    server: createServer(app)
  });


const port = parseInt(process.env.PORT, 10) || 3000
// const gameServer = new Server()

app.use("/colyseus", basicAuthMiddleware, monitor());
// gameServer.use("/colyseus", monitor());
gameServer.listen(port)
console.log(`[GameServer] Listening on Port: ${port}`);

gameServer.define("tictactoe", Tictactoe);