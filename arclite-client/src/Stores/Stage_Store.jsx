import { create } from "zustand";
import { persist } from "zustand/middleware";

const Stage_Store = create(
    persist(
        (set) => ({
            stage: "authentication",
            set_stage: (stage) => set({ stage }),
            reset_stage: () => set({ stage: "authentication" }),
        }),
        {
            name: "arclite_stage",
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

export default Stage_Store;
