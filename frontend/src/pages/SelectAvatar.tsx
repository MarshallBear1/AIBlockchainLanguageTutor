import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarSelector } from "@/components/avatar/AvatarSelector";
import { AvatarCharacter } from "@/types/avatar";

const SelectAvatar = () => {
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>("default");

  const handleAvatarSelect = (character: AvatarCharacter) => {
    setSelectedAvatar(character.id);
    // Save to localStorage for later use
    localStorage.setItem("selectedAvatar", character.id);
  };

  const handleContinue = () => {
    if (!selectedAvatar) {
      return;
    }
    navigate("/setup");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 transition-all" />
          </div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/select-level")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Choose Your Conversation Partner</h1>
          <p className="text-lg text-muted-foreground">
            Select an avatar to practice conversations with
          </p>
        </div>

        {/* Avatar Selection */}
        <AvatarSelector
          selectedAvatar={selectedAvatar}
          onSelect={handleAvatarSelect}
        />

        {/* Continue Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedAvatar}
            size="lg"
            className="w-full max-w-md h-14 text-lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectAvatar;
