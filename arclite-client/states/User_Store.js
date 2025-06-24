// states/User_Store.js
import { create } from "zustand";

const User_Store = create((set) => ({
    username: "",
    is_host: false,
    max_players: 4,

    set_username: (name) => set({ username: name }),
    set_is_host: (val) => set({ is_host: val }),
    set_max_players: (num) => set({ max_players: num }),

    reset_user: () => set({ username: "", is_host: false, max_players: 4 }),
}));

export default User_Store;
