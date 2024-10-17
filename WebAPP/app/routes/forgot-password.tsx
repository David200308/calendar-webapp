import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.client";
import { checkEmailExists } from "~/firebase/collection/users";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
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
        const res = await checkEmailExists(email);
        if (!res) {
            setError("Email not found");
            return;
        }
        await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
        if (err instanceof Error)
            setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-black">Reset Password</h2>
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
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900"
            >
              Send Reset Email
            </button>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
        <p className="text-sm text-center text-black">
          Remember your account?{" "}
          <a href="/login" className="font-medium text-gray-800 hover:text-gray-900">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
