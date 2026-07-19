// server/Socket_Handler.js

export function socket_handler(io) {
    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const { firebase_uid } = socket.handshake.auth;

        if (!firebase_uid) {
            return next(new Error("Authentication failed"));
        }

        // TODO: You might want to validate the firebase_uid here, e.g., check against a database or Firebase Admin SDK.
        // but for now, we'll just accept any non-empty string.

        socket.data.firebase_uid = firebase_uid;
        console.log(
            `🔑 Authenticated socket: ${socket.id} with firebase_uid: ${firebase_uid}`,
        );

        next(); // Allow the connection
    });

    io.on("connection", (socket) => {
        console.log(`🔌 connected: ${socket.id}`);
    });
}
