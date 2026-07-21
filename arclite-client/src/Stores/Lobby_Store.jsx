import { create } from "zustand";
import { persist } from "zustand/middleware";

const Lobby_Store = create(
    persist(
        (set) => ({
            lobby_id: null,
            players: [],
            host_uid: null,
            max_players: 4,

            set_lobby_id: (lobby_id) => set({ lobby_id: lobby_id }),
            set_players: (players_list) => set({ players: players_list }),
            set_host_uid: (firebase_uid) => set({ host_uid: firebase_uid }),
            set_max_players: (max_players) => set({ max_players: max_players }),

            reset_lobby: () =>
                set({
                    lobby_id: null,
                    players: [],
                    host_uid: null,
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
        },
    ),
);

export default Lobby_Store;
