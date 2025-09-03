// states/User_Store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const User_Store = create(
    persist(
        (set) => ({
            username: "",
            set_username: (name) => set({ username: name }),
            reset_user: () => set({ username: "" }),
        }),
        {
            name: "arclite_user",
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

export default User_Store;
