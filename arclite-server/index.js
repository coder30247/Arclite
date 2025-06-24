// server/index.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { socket_handler } from "./Socket_Handler.js"; // Ensure this file also uses ESM syntax

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
    pingTimeout: 5000,
    pingInterval: 10000,
});

app.use(express.static("public"));

socket_handler(io); // Initialize all socket handlers

server.listen(4000, () => {
    console.log("🎮 Server running at http://localhost:4000");
});
