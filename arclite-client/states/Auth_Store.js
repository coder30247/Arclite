// states/Auth_Store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const Auth_Store = create(
    persist(
        (set) => ({
            firebase_uid: null,
            set_firebase_uid: (firebase_uid) => set({ firebase_uid }),
            reset_auth: () => set({ firebase_uid: null }),
        }),
        {
            name: "arclite_auth",
            storage: {
                getItem: (key) => {
                    const item = sessionStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (key, value) => {
                    sessionStorage.setItem(key, JSON.stringify(value));
                },
                removeItem: (key) => {
                    sessionStorage.removeItem(key);
                },
            },
        }
    )
);

export default Auth_Store;
