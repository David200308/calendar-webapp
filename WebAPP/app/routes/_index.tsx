import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Calendar Web APP" },
    { name: "description", content: "Calendar Web APP" },
  ];
};

export default function Index() {
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

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-black">Calendar Web APP</h1>
        <div className="space-x-4 mb-8 pb-4">
          <button className="px-6 py-2 bg-black text-white rounded hover:bg-black transition duration-300"
            onClick={() => {
              navigate("/login");
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
