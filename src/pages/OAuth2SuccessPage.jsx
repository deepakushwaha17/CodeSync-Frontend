import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuth2SuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      navigate("/auth");
      return;
    }

    const user = {
      userId: params.get("userId"),
      username: params.get("username"),
      email: params.get("email"),
      role: params.get("role"),
    };

    localStorage.setItem("token", token);
    localStorage.setItem("userId", user.userId);
    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard", { replace: true });
  }, [params, navigate]);

  return <h2>Login successful. Redirecting...</h2>;
}