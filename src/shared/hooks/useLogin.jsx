import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login as loginRequest } from "../../services/api"; // ajusta ruta si es necesario

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async ({ email, username, password }) => {
    setIsLoading(true);

    try {
      const data = { password };
      if (email) data.email = email;
      if (username) data.username = username;

      console.log("Datos enviados para login:", data);

      const response = await loginRequest(data);
      const { userDetails } = response.data;

      if (!userDetails || !userDetails.token) {
        throw new Error("Error al obtener datos del usuario.");
      }

      const userData = {
        ...userDetails,
        role: userDetails.role?.toUpperCase() || "",
        token: userDetails.token,
      };

      // Guardamos en localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("username", userDetails.username);

      // Imprimir localStorage para depuración
      console.log("LocalStorage después de login:", localStorage.getItem("user"));

      toast.success("Sesión iniciada correctamente ✅");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          "Ocurrió un error al iniciar sesión, intenta de nuevo ❌"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
};
