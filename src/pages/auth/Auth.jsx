import { useEffect } from "react";
import { Login } from "../../components/Login";
import "./Auth.css";

export const Auth = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.lineicons.com/4.0/lineicons.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="auth-page d-flex align-items-center justify-content-center">
      <div className="auth-container card shadow-lg">
        <div className="card-body d-flex flex-column align-items-center">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default Auth;
