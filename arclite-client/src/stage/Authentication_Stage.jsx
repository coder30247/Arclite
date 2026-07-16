import { firebase_auth } from "../lib/Firebase.jsx";
import { signInAnonymously } from "firebase/auth";
import Auth_Store from "../Stores/Auth_Store.jsx";
import Stage_Store from "../Stores/Stage_Store.jsx";

export default function Authentication_Stage() {
    const firebase_uid = Auth_Store((state) => state.firebase_uid);
    const set_firebase_uid = Auth_Store((state) => state.set_firebase_uid);
    const set_stage = Stage_Store((state) => state.set_stage);

    function handle_login() {
        console.log("Login button clicked");
    }

    function handle_signup() {
        console.log("Signup button clicked");
    }

    async function handleGuestAccount() {
        console.log("Guest Account button clicked");
        try {
            const result = await signInAnonymously(firebase_auth);
            console.log(
                `Guest login successful: ${result.user.uid}, isAnonymous: ${result.user.isAnonymous}`,
            );

            set_firebase_uid(result.user.uid);
            set_stage("home");
        } catch (error) {
            console.error("Guest login error:", error);
        }
    }
    return (
        <div>
            <h1>Authentication Stage</h1>
            <p>
                here you will choose your login method, login, signup, guest
                account
            </p>
            <button>Login</button>
            <button>Signup</button>
            <button onClick={handleGuestAccount}>Guest Account</button>
        </div>
    );
}
