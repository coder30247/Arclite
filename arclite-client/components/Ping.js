import { useEffect, useState } from "react";

export default function Ping(socket) {
    const [ping, set_ping] = useState(null);

    useEffect(() => {
        if (!socket || !socket.connected) {
            set_ping(999);
            return;
        }

        const ping_interval = setInterval(() => {
            const start_time = Date.now();
            let responded = false;

            // emit ping_check
            socket.emit("ping_check", () => {
                responded = true;
                const latency = Date.now() - start_time;
                set_ping(latency);
            });

            // if no response in 2 seconds, assume disconnected
            setTimeout(() => {
                if (!responded) {
                    set_ping(999); // simulate bad ping
                }
            }, 2000);
        }, 3000); // ping every 3s

        return () => clearInterval(ping_interval);
    }, [socket]);

    return ping;
}
