// states/Lobby_Store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
            name: "lobby_store",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default Lobby_Store;
