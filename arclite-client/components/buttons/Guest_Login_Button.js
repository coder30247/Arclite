import { signInAnonymously } from "firebase/auth";
import { auth } from "../../lib/Firebase.js";

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
            const result = await signInAnonymously(auth);
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
            className="button button_guest"
            onClick={handle_guest_login}
            disabled={loading}
            data-hover="Jump In!"
            >
                <span>{loading ? "Logging in..." : "Play as Guest"}</span>
        </button>

    );
}
