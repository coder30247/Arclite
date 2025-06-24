import { useRouter } from "next/router";

export default function Login_Button() {
    const router = useRouter();
    return (
        <button className="button-glow" onClick={() => router.push("/login")}>
            Login
        </button>
    );
}
