// states/Lobby_Store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const Lobby_Store = create(
    persist(
        (set) => ({
            lobby_id: null,
            players: [],
            host_id: null,
            max_players: 4,

            set_lobby_id: (id) => set({ lobby_id: id }),
            set_players: (players_list) => set({ players: players_list }),
            set_host_id: (id) => set({ host_id: id }),
            set_max_players: (num) => set({ max_players: num }),

            reset_lobby: () =>
                set({
                    lobby_id: null,
                    players: [],
                    host_id: null,
                    max_players: 4,
                }),
        }),
        {
            name: "arclite_lobby",
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

export default Lobby_Store;
