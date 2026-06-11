import { useEffect } from "react";
import { useNavigate } from "react-router";
import apiClient from "@/api/client";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        await apiClient.get("/auth/me");
        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    };

    verifySession();
  }, [navigate]);

  return <div className="flex items-center justify-center">Authenticating...</div>;
}
