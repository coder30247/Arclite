// lib/firebase.js
import { initializeApp } from "firebase/app";
import {
    getAuth,
    setPersistence,
    browserSessionPersistence, // Changed from inMemoryPersistence
} from "firebase/auth";
// config
const firebase_config = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
};

const firebase_app = initializeApp(firebase_config);
const firebase_auth = getAuth(firebase_app);

// Use browserSessionPersistence instead
setPersistence(firebase_auth, browserSessionPersistence)
    .then(() => {
        console.log("✅ Firebase session persistence set successfully");
    })
    .catch((error) => {
        console.error("❌ Firebase persistence error:", error);
    });

export { firebase_auth };
