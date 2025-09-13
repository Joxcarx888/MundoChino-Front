import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLogin } from "../shared/hooks/useLogin";
import { useState } from "react";
import toast from "react-hot-toast";

import iconEmail from "../assets/icons/3.png";
import iconPassword from "../assets/icons/5.png";
import logo from "../assets/img/logo.png";
import eyeOpen from "../assets/icons/ojo1.png";
import eyeClosed from "../assets/icons/ojo2.png";

export const Login = () => {
  const { login, isLoading } = useLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    if (!data.identifier) {
      toast.error("El correo o usuario es obligatorio");
      return;
    }
    if (!data.password) {
      toast.error("La contraseña es obligatoria");
      return;
    }

    const loginData = { password: data.password };
    if (data.identifier.includes("@")) {
      loginData.email = data.identifier.toLowerCase();
    } else {
      loginData.username = data.identifier;
    }

    try {
      await login(loginData);
    } catch (error) {
      toast.error(
        error.response?.status === 400
          ? "Correo/usuario o contraseña incorrectos"
          : "Error al iniciar sesión. Intenta más tarde."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-100 text-center">
      <div className="auth-logo mb-3">
        <img src={logo} alt="Logo" />
      </div>

      <h2 className="auth-title mb-4">Iniciar Sesión</h2>

      {/* Input Usuario/Email */}
      <div className="input-group mb-3 auth-input">
        <span className="input-group-text">
          <img src={iconEmail} alt="icono email" className="input-icon" />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Correo o usuario"
          {...register("identifier", { required: true })}
        />
      </div>
      {errors.identifier && <p className="auth-error">Este campo es obligatorio</p>}

      {/* Input Contraseña */}
      <div className="input-group mb-3 auth-input">
        <span className="input-group-text">
          <img src={iconPassword} alt="icono contraseña" className="input-icon" />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          className="form-control"
          placeholder="Contraseña"
          {...register("password", { required: true })}
        />
        <span className="input-group-text toggle-password" onClick={() => setShowPassword(!showPassword)}>
          <img src={showPassword ? eyeOpen : eyeClosed} alt="Mostrar contraseña" />
        </span>
      </div>
      {errors.password && <p className="auth-error">Este campo es obligatorio</p>}

      <a href="/auth" className="auth-link d-block mb-3">
        ¿Olvidaste tu contraseña?
      </a>

      <button type="submit" className="btn btn-dark w-100 auth-button" disabled={isLoading}>
        {isLoading ? "Cargando..." : "Iniciar Sesión"}
      </button>
    </form>
  );
};
