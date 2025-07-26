// firebase.js
import { initializeApp } from "firebase/app";
import {
    getAuth,
    setPersistence,
    browserSessionPersistence,
} from "firebase/auth";

// config
const firebase_config = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
};

// initialize firebase
const firebase_app = initializeApp(firebase_config);
const firebase_auth = getAuth(firebase_app);

// initialize persistence
const init_firebase_auth = async () => {
    try {
        await setPersistence(firebase_auth, browserSessionPersistence);
        console.log("✅ firebase session persistence set");
    } catch (error) {
        console.error("❌ firebase persistence error:", error);
    }
};

export { firebase_auth, init_firebase_auth };
