import { useEffect, useRef, useState } from "react";
import { auth } from "../lib/Firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { io } from "socket.io-client";

import Auth_Store from "../states/Auth_Store.js";
import Socket_Store from "../states/Socket_Store.js";
import User_Store from "../states/User_Store.js";
import Login_Button from "./buttons/Login_Button.js";
import Signup_Button from "./buttons/Signup_Button.js";
import Guest_Login_Button from "./buttons/Guest_Login_Button.js";

const initialize_socket = (current_user, socket_ref) => {
    const { set_socket, set_connected } = Socket_Store.getState();
    const { set_username } = User_Store.getState();

    if (!current_user) {
        console.error("Attempted to initialize socket without user");
        return null;
    }
    if (socket_ref.current) {
        console.log(
            `Socket already initialized, skipping: ${socket_ref.current.id}`
        );
        return socket_ref.current;
    }
    console.log(`Initializing Socket.IO for user: ${current_user.uid}`);
    socket_ref.current = io("http://localhost:4000", {
        autoConnect: true,
        reconnection: false,
    });
    socket_ref.current.on("connect", () => {
        console.log(
            `Socket connected: ${current_user.uid}, ${socket_ref.current.id}`
        );
        const username =
            current_user.displayName ||
            (current_user.isAnonymous ? "Guest" : "User");
        socket_ref.current.emit("auth", {
            firebase_uid: current_user.uid,
            username,
        });
        set_username(username); // Set username in User_Store
        set_connected(true);
    });
    socket_ref.current.on("error", (message) => {
        console.error(`Socket error: ${message}`);
    });
    socket_ref.current.on("connect_error", (error) => {
        console.error(`Socket connect error: ${error.message}`);
    });
    socket_ref.current.on("disconnect", (reason) => {
        console.log(
            `Socket disconnected: ${socket_ref.current?.id}, reason: ${reason}`
        );
        socket_ref.current = null;
        set_socket(null);
        set_connected(false);
    });
    set_socket(socket_ref.current);
    return socket_ref.current;
};

export { initialize_socket };

export default function Login_Gate({ children }) {
    const firebase_uid = Auth_Store((state) => state.firebase_uid);
    const set_firebase_uid = Auth_Store((state) => state.set_firebase_uid);
    const set_is_authenticated = Auth_Store(
        (state) => state.set_is_authenticated
    );
    const reset_auth = Auth_Store((state) => state.reset_auth);
    const reset_socket = Socket_Store((state) => state.reset_socket);
    const reset_user = User_Store((state) => state.reset_user);
    const [loading, set_loading] = useState(true);
    const [login_error, set_login_error] = useState(null);
    const socket_ref = useRef(null);

    useEffect(() => {
        console.log("Setting up auth listener");
        const unsubscribe = onAuthStateChanged(
            auth,
            (current_user) => {
                console.log(
                    `onAuthStateChanged fired:`,
                    current_user
                        ? {
                              uid: current_user.uid,
                              isAnonymous: current_user.isAnonymous,
                          }
                        : null
                );
                if (current_user) {
                    if (!firebase_uid || firebase_uid !== current_user.uid) {
                        set_firebase_uid(current_user.uid);
                        set_is_authenticated(true);
                        if (!socket_ref.current) {
                            initialize_socket(current_user, socket_ref);
                        }
                    }
                } else {
                    reset_auth();
                    reset_user(); // Reset User_Store on logout
                    cleanup_socket();
                }
                set_loading(false);
            },
            (error) => {
                console.error(`onAuthStateChanged error: ${error}`);
                set_loading(false);
                set_login_error(error.message);
            }
        );

        return () => {
            console.log("Cleaning up auth listener");
            unsubscribe();
        };
    }, [
        firebase_uid,
        set_firebase_uid,
        set_is_authenticated,
        reset_auth,
        reset_user,
    ]);

    const cleanup_socket = () => {
        if (socket_ref.current) {
            console.log(`Cleaning up socket: ${socket_ref.current.id}`);
            socket_ref.current.disconnect();
            socket_ref.current = null;
            reset_socket();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
                Loading...
            </div>
        );
    }

    if (login_error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-red-700">
                Error: {login_error}
            </div>
        );
    }

    if (!firebase_uid) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-10 w-full max-w-md text-center">
                    <h1 className="text-4xl font-extrabold text-cyan-400 drop-shadow-md mb-6 tracking-wide">
                        Welcome to Arclite
                    </h1>

                    <p className="text-base text-gray-300 mb-8">
                        Please choose a way to log in and start playing.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Login_Button />
                        <Signup_Button />
                        <Guest_Login_Button />
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
