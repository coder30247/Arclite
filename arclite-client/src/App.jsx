import Authentication_Stage from "./stages/Authentication_Stage";
import Home_Stage from "./stages/Home_Stage";
import Stage_Store from "./stores/Stage_Store";

export default function App() {
    const stage = Stage_Store((state) => state.stage);

    switch (stage) {
        case "authentication":
            return <Authentication_Stage />;
        case "home":
            return <Home_Stage />;
        default:
            return <Authentication_Stage />;
    }
}
