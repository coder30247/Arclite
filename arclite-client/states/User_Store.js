// states/User_Store.js
import { create } from "zustand";

const User_Store = create((set) => ({
    username: "",
    set_username: (name) => set({ username: name }),
    reset_user: () => set({ username: "" }),
}));

export default User_Store;
