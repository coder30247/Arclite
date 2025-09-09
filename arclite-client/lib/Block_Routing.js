import { useEffect } from "react";

export default function Block_Routing() {
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);

        const handle_pop_state = () => {
            window.history.pushState(null, "", window.location.href);
        };

        window.addEventListener("popstate", handle_pop_state);

        return () => {
            window.removeEventListener("popstate", handle_pop_state);
        };
    }, []);

    return null;
}
