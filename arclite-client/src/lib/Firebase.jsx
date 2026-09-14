import { initializeApp } from "firebase/app";
import {
    getAuth,
    setPersistence,
    browserSessionPersistence,
} from "firebase/auth";
import { signOut } from "firebase/auth";

const firebase_config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebase_app = initializeApp(firebase_config);
const firebase_auth = getAuth(firebase_app);

setPersistence(firebase_auth, browserSessionPersistence)
    .then(() => {
        console.log("✅ Firebase session persistence set successfully");
    })
    .catch((error) => {
        console.error("❌ Firebase persistence error:", error);
    });

const sign_out = async () => {
    try {
        await signOut(firebase_auth);
        console.log("✅ User signed out successfully");
    } catch (error) {
        console.error("❌ Error signing out:", error);
    }
};
export { firebase_auth, sign_out };
