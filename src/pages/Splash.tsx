import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TokiMascot from "@/components/TokiMascot";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is logged in, check if they've completed onboarding
        const selectedLanguage = localStorage.getItem("selectedLanguage");
        
        if (selectedLanguage) {
          // Already completed onboarding, go to home
          navigate("/home");
        } else {
          // Logged in but needs to complete onboarding
          navigate("/select-language");
        }
      } else {
        // Not logged in, go to auth
        navigate("/auth");
      }
    };

    const timer = setTimeout(checkAuthAndRedirect, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <TokiMascot state="idle" size="lg" />
    </div>
  );
};

export default Splash;
