// states/User_Store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const User_Store = create(
  persist(
    (set) => ({
      username: "",

      set_username: (name) => set({ username: name }),
      reset_user: () => set({ username: "" }),
    }),
    {
      name: "user_store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default User_Store;
