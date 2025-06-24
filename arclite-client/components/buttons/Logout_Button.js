import { signOut } from "firebase/auth";
import { auth } from "../../lib/Firebase.js";

export default function Logout_Button() {
    const handle_logout = async () => {
        try {
            await signOut(auth);
            alert("Logged out!");
        } catch (error) {
            console.error(`Logout error: ${error}`);
            alert("Error logging out.");
        }
    };

    return (
        <button
            className="relative inline-flex items-center justify-center px-6 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition transform hover:scale-105 shadow-md"
            onClick={handle_logout}
        >
            🔓 Logout
        </button>
    );
}
