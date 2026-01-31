import { useState } from "react";
import { login } from "@api/auth";
import { useNavigate } from "react-router";
import { useAppStore } from "@/stores/appStore";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState("adam@gmail.com");
  const [password, setPassword] = useState("testing");
  const [error, setError] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const auth: any = await login(email, password);
      const { user } = auth.data;
      console.log("Logged in user:", user);
      setUser(user);

      // Redirect on success
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }

      // navigate("/admin");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="w-1/3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3"
          />
          <button type="submit">Login</button>
        </form>
        <b>OR</b>
        <div className="flex justify-center">
          <button
            onClick={() => {
              window.location.href = "http://localhost:8080/api/auth/google";
            }}
          >
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}
