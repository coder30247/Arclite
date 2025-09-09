// components/Ping.js
import { useEffect, useState } from "react";
import { useStore } from "zustand";

import Socket_Store from "../states/Socket_Store.js";

export default function Ping() {
    const [ping, set_ping] = useState(null);
    const socket = useStore(Socket_Store, (state) => state.socket);

    useEffect(() => {
        // 🚫 if no socket or not connected, set to 999 and exit
        if (!socket || !socket.connected) {
            set_ping(999);
            return;
        }

        // 🧾 track active timeouts to clean them up
        const active_timeouts = [];

        // 🔁 function to clean up all pending timeouts
        const clear_all_timeouts = () => {
            active_timeouts.forEach((timeout_id) => clearTimeout(timeout_id));
            active_timeouts.length = 0; // clear array
        };

        // 📡 emit ping and measure response
        const send_ping = () => {
            const start_time = Date.now();
            let responded = false;

            socket.emit("ping_check", () => {
                responded = true;
                const latency = Date.now() - start_time;
                set_ping(latency);
            });

            // ⏱️ set timeout to mark as 999 if no response in 2s
            const timeout_id = setTimeout(() => {
                if (!responded) {
                    set_ping(999);
                }
                // remove this timeout from active list
                const index = active_timeouts.indexOf(timeout_id);
                if (index > -1) {
                    active_timeouts.splice(index, 1);
                }
            }, 2000);

            active_timeouts.push(timeout_id);
        };

        // 🔄 start ping interval — every 3 seconds
        const ping_interval = setInterval(send_ping, 3000);

        // 🚀 send first ping immediately
        send_ping();

        // 🧹 CLEANUP on socket change or unmount
        return () => {
            clearInterval(ping_interval);
            clear_all_timeouts();
        };
    }, [socket]); // 👈 restart when socket changes (reconnect!)

    return ping;
}
