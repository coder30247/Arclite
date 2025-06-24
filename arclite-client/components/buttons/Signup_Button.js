import { useRouter } from "next/router";

export default function Signup_Button() {
    const router = useRouter();
    return (
        <button className="button-glow" onClick={() => router.push("/signup")}>
            Sign Up
        </button>
    );
}
