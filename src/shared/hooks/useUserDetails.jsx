import { useState, useEffect } from "react";
import { logout as logoutHandler } from "./useLogout";

const getUserDetails = () => {
  const userDetails = localStorage.getItem("user");
  return userDetails ? JSON.parse(userDetails) : null;
};

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(getUserDetails());
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar con localStorage si cambia
  useEffect(() => {
    const handleStorageChange = () => {
      setUserDetails(getUserDetails());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutHandler();
      setUserDetails(null);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLogged: Boolean(userDetails?.token),
    username: userDetails?.username ?? "Guest",
    role: userDetails?.role ?? "",
    token: userDetails?.token ?? null,
    logout,
    setUserDetails,
    user: userDetails,
    isLoading,
  };
};
