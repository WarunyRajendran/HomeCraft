import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthListener = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL hash for recovery token (Supabase format)
    // Only the tab that received the recovery link will have this hash
    const hash = window.location.hash;

    if (hash && hash.includes("type=recovery") && location.pathname !== "/reset-password") {
      navigate("/reset-password" + hash, { replace: true });
      return;
    }

    // Check if this is an email confirmation (type=signup in hash)
    // If so, sign out the user and redirect to login page
    if (hash && hash.includes("type=signup")) {
      const handleEmailConfirmation = async () => {
        await supabase.auth.signOut();
        // Clear the hash from URL
        window.history.replaceState(null, "", window.location.pathname);
        toast.success("Email confirmé ! Vous pouvez maintenant vous connecter.");
        navigate("/auth", { replace: true });
      };
      handleEmailConfirmation();
    }
  }, [navigate, location.pathname]);

  return null;
};
