import { create } from "zustand";
import { persist } from "zustand/middleware";

const Lobby_Store = create(
    persist(
        (set) => ({
            lobby_id: null,
            players: [],
            host_uid: null,
            max_players: 4,

            set_lobby_id: (lobby_id) => set({ lobby_id }),

            set_players: (players_list) => set({ players: players_list }),

            set_host_uid: (firebase_uid) => set({ host_uid: firebase_uid }),

            set_max_players: (max_players) => set({ max_players }),

            set_lobby: (lobby_data) =>
                set({
                    lobby_id: lobby_data.lobby_id,
                    players: lobby_data.players,
                    host_uid: lobby_data.host_uid,
                    max_players: lobby_data.max_players,
                }),
            update_lobby: (lobby_data) =>
                set({
                    players: lobby_data.players,
                    host_uid: lobby_data.host_uid,
                    max_players: lobby_data.max_players,
                }),

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

            // Only persist lobby_id
            partialize: (state) => ({
                lobby_id: state.lobby_id,
            }),
        },
    ),
);

export default Lobby_Store;
