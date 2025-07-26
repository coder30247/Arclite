// states/Auth_Store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const Auth_Store = create(
    persist(
        (set) => ({
            firebase_uid: null,

            set_firebase_uid: (firebase_uid) =>
                set({ firebase_uid: firebase_uid }),
            reset_auth: () => set({ firebase_uid: null }),
        }),
        {
            name: "auth_store",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default Auth_Store;
