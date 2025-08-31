// components/buttons/Logout_Button.js
import { signOut } from "firebase/auth";
import { firebase_auth } from "../../lib/Firebase";

import { useStore } from "zustand";
import Socket_Store from "../../states/Socket_Store";
import Auth_Store from "../../states/Auth_Store";
import User_Store from "../../states/User_Store";


export default function Logout_Button() {
    // ✅ Use real store values
    const socket = useStore(Socket_Store, (state) => state.socket);
    const firebase_uid = useStore(Auth_Store, (state) => state.firebase_uid);

    // Get resetters
    const reset_auth = useStore(Auth_Store, (state) => state.reset_auth);
    const reset_user = useStore(User_Store, (state) => state.reset_user);
    const reset_socket = useStore(Socket_Store, (state) => state.reset_socket);

    const handle_logout = () => {
        console.log("User logging out:", firebase_uid);

        if (!firebase_uid) {
            return;
        }

        // ✅ 1. Emit logout event for immediate server-side cleanup
        if (socket?.connected) {
            console.log("Emitting 'logout' event to server...");
            socket.emit("logout", {}, (ack) => {
                console.log("Logout acknowledged by server", ack);
            });
        }
        
        reset_socket(); // Zustand: socket = null, connected = false
        reset_auth();     // firebase_uid = null
        reset_user();     // username = ""

        // ✅ 4. Firebase sign-out
        signOut(firebase_auth)
            .then(() => {
                console.log("Firebase sign-out complete");
                alert("Logged out!");
            })
            .catch((error) => {
                console.error("Firebase sign-out error:", error);
                alert("Error during logout.");
            });
    };

    return (
        <button
            onClick={handle_logout}
            className="relative inline-flex items-center justify-center px-6 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition transform hover:scale-105 shadow-md"
            aria-label="Logout from Arclite"
        >
            🔓 Logout
        </button>
    );
}