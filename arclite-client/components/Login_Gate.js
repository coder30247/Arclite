// components/Login_Gate.js

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { io } from "socket.io-client";

import { firebase_auth } from "../lib/Firebase.js";
import { Initialize_Socket } from "../lib/Initialize_Socket.js";

import Auth_Store from "../states/Auth_Store.js";
import Socket_Store from "../states/Socket_Store.js";
import User_Store from "../states/User_Store.js";
import Login_Button from "./buttons/Login_Button.js";
import Signup_Button from "./buttons/Signup_Button.js";
import Guest_Login_Button from "./buttons/Guest_Login_Button.js";

export default function Login_Gate({ children }) {
    const firebase_uid = Auth_Store((state) => state.firebase_uid);
    const set_firebase_uid = Auth_Store((state) => state.set_firebase_uid);
    const reset_auth = Auth_Store((state) => state.reset_auth);
    const reset_socket = Socket_Store((state) => state.reset_socket);
    const set_username = User_Store((state) => state.set_username);
    const reset_user = User_Store((state) => state.reset_user);
    const socket = Socket_Store((state) => state.socket);
    const [loading, set_loading] = useState(true);
    const [login_error, set_login_error] = useState(null);

    // In Login_Gate.js
    useEffect(() => {
        console.log("🔥 Setting up auth listener");

        const unsubscribe = onAuthStateChanged(
            firebase_auth,
            (current_user) => {
                if (current_user) {
                    console.log("✅ User logged in:", {
                        firebase_uid: current_user.uid,
                        isAnonymous: current_user.isAnonymous,
                        username: current_user.displayName,
                    });

                    set_firebase_uid(current_user.uid);
                    set_username(current_user.displayName || "Guest");

                    if (!socket) {
                        Initialize_Socket({
                            firebase_uid: current_user.uid,
                            username: current_user.displayName || "Guest",
                        });
                    }
                } else {
                    console.log("🚪 User logged out");
                    reset_auth();
                    reset_user();
                    cleanup_socket();
                }

                set_loading(false);
            },
            (error) => {
                console.error("🔥 Auth listener error:", error);
                set_loading(false);
                set_login_error(error.message);
            }
        );

        return () => {
            console.log("🔥 Cleaning up auth listener");
            unsubscribe();
        };
    }, []);

    const cleanup_socket = () => {
        if (socket) {
            console.log(`Cleaning up socket: ${socket.id}`);
            socket.disconnect();
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
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl px-8 py-12 w-full max-w-md text-center animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-cyan-400 drop-shadow-md mb-6 tracking-wider">
                        Welcome to Arclite
                    </h1>
                    <p className="text-sm sm:text-base text-gray-300 mb-8 tracking-wide">
                        Choose a login method to enter the battle.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-center gap-4 w-full">
                        <Login_Button />
                        <Signup_Button />
                        <Guest_Login_Button
                            loading={loading}
                            set_loading={set_loading}
                            set_login_error={set_login_error}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
