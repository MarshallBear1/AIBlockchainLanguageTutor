import { Card } from "@/components/ui/card";
import { avatarCharacters } from "@/config/avatarConfig";
import { AvatarCharacter } from "@/types/avatar";
import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onSelect: (character: AvatarCharacter) => void;
}

export const AvatarSelector = ({ selectedAvatar, onSelect }: AvatarSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {avatarCharacters.map((character) => (
        <Card
          key={character.id}
          onClick={() => onSelect(character)}
          className={cn(
            "p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105",
            selectedAvatar === character.id && "ring-2 ring-primary border-primary"
          )}
        >
          <div className="space-y-3">
            {character.thumbnail && (
              <img
                src={character.thumbnail}
                alt={character.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="text-xl font-bold">{character.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{character.description}</p>
              {character.personality && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Personality: {character.personality}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
