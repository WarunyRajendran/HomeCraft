import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const AuthListener = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL hash for recovery token (Supabase format)
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery") && location.pathname !== "/reset-password") {
      navigate("/reset-password" + hash, { replace: true });
      return;
    }

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          if (location.pathname !== "/reset-password") {
            navigate("/reset-password", { replace: true });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
};
