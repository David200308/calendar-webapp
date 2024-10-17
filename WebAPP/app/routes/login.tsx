import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase.client";
import { addUserCollection } from "~/firebase/collection/users";
import { serverTimestamp } from "firebase/firestore";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const res = await fetch('/verifyToken', {
                method: 'POST',
            });
            if (res.status === 401) {
                return;
            }
            navigate('/calendar');
        };
        verifyToken();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            if (!email || !password) {
                setError("Email and password are required");
                return;
            }
            const user = await signInWithEmailAndPassword(auth, email, password);
            const userCreds = user.user;
            const idToken = await userCreds.getIdToken();
            const response = await fetch("/signin", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ email: userCreds.email }),
            });
            if (!response.ok) {
                setError("Failed to sign in");
                return;
            }

            navigate("/calendar");
        } catch (err: unknown) {
            if (err instanceof Error)
                setError(err.message);
        }
    };

    const handleGoogleLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        const provider = new GoogleAuthProvider();
        try {
            const newUser = await signInWithPopup(auth, provider);
            const userCreds = newUser.user;
            const res = await addUserCollection({
                uid: userCreds.uid,
                email: userCreds.email!,
                createdAt: serverTimestamp(),
                createVia: "google",
            });
            if (!res) {
                setError("Failed to create user");
                return;
            }
            const idToken = await userCreds.getIdToken();
            const response = await fetch("/signin", {
                method: "POST",
                headers: { Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ email: userCreds.email }),
            });
            if (!response.ok) {
                setError("Failed to sign in");
                return;
            }

            navigate("/calendar");
        } catch (err: unknown) {
            if (err instanceof Error)
                setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-black">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900"
                        >
                            Login
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center text-black">
                    <div className="mb-2">
                        Don`t have an account?{" "}
                        <a href="/signup" className="font-medium text-gray-800 hover:text-gray-900">
                            Sign up
                        </a>
                    </div>
                    <a href="/forgot-password" className="font-medium text-gray-800 hover:text-gray-900">
                        Forgot password?
                    </a>
                </div>
                <hr />
                <div className="mt-4 text-center">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full px-4 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900"
                    >
                        Sign in with Google
                    </button>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
            </div>
        </div>
    );
}
