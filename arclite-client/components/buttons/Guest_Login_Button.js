// components/buttons/Guest_Login_Button.js
import { signInAnonymously } from "firebase/auth";
import { firebase_auth } from "../../lib/Firebase.js";

export default function Guest_Login_Button({
    loading,
    set_loading,
    set_login_error,
}) {
    const handle_guest_login = async () => {
        if (loading) return;
        set_loading(true);
        set_login_error(null);

        try {
            console.log("Attempting guest login");
            const result = await signInAnonymously(firebase_auth);
            console.log(
                `Guest login successful: ${result.user.uid}, isAnonymous: ${result.user.isAnonymous}`
            );
        } catch (err) {
            console.error(`Guest login failed: ${err}`);
            set_login_error(`Guest login failed: ${err.message}`);
        } finally {
            set_loading(false);
        }
    };

    return (
        <button
            className={`w-full px-6 py-2 rounded-xl text-white font-semibold shadow-md transition transform hover:scale-105 ${
                loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
            }`}
            onClick={handle_guest_login}
            disabled={loading}
        >
            {loading ? "Logging in..." : "Play as Guest"}
        </button>
    );
}
