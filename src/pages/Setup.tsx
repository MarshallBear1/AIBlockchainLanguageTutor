import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Setup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState("Setting up your profile...");

  useEffect(() => {
    const syncProfileData = async () => {
      try {
        // Get user preferences from localStorage
        const selectedLanguage = localStorage.getItem("selectedLanguage") || "es";
        const selectedLevel = localStorage.getItem("selectedLevel") || "1";
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error("Not authenticated");
        }

        setStatus("Saving your preferences...");

        // Update user profile with selected language and level
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            selected_language: selectedLanguage,
            selected_level: parseInt(selectedLevel),
          })
          .eq("id", user.id);

        if (updateError) {
          throw updateError;
        }

        setStatus("Almost done...");

        // Small delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        navigate("/home");
      } catch (error) {
        console.error("Setup error:", error);
        toast({
          title: "Setup Error",
          description: "Failed to save your preferences. Please try again.",
          variant: "destructive",
        });
        // Navigate anyway after 2 seconds
        setTimeout(() => navigate("/home"), 2000);
      }
    };

    syncProfileData();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 transition-all" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-8" />
          <h1 className="text-3xl font-bold mb-4">We're setting everything up for you</h1>
          <p className="text-lg text-muted-foreground">{status}</p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
