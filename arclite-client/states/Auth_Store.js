// states/Auth_Store.js
import { create } from "zustand";

const Auth_Store = create((set) => ({
    firebase_uid: null,
    set_firebase_uid: (firebase_uid) => set({ firebase_uid }),
    reset_auth: () => set({ firebase_uid: null }),
}));

export default Auth_Store;
