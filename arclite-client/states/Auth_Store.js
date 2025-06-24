// states/Auth_Store.js
import { create } from "zustand";

const Auth_Store = create((set) => ({
    firebase_uid: null,
    is_authenticated: false,

    set_firebase_uid: (firebase_uid) => set({ firebase_uid: firebase_uid }),
    set_is_authenticated: (val) => set({ is_authenticated: val }),
    reset_auth: () => set({ firebase_uid: null, is_authenticated: false }),
}));
export default Auth_Store;
