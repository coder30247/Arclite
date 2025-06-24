// states/Socket_Store.js
import { create } from "zustand";

const Socket_Store = create((set) => ({
    socket: null,
    connected: false,

    set_socket: (socket_instance) => set({ socket: socket_instance }),
    set_connected: (val) => set({ connected: val }),
    reset_socket: () => set({ socket: null, connected: false }),
}));
export default Socket_Store;
