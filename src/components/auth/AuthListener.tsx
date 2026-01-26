import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthListener = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL hash for recovery token (Supabase format)
    // Only the tab that received the recovery link will have this hash
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery") && location.pathname !== "/reset-password") {
      navigate("/reset-password" + hash, { replace: true });
    }
  }, [navigate, location.pathname]);

  return null;
};
