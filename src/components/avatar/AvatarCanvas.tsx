import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { AvatarExperience } from "./AvatarExperience";
import { AvatarChatProvider } from "@/hooks/useAvatarChat";

interface AvatarCanvasProps {
  modelPath?: string;
  className?: string;
}

export const AvatarCanvas = ({ modelPath, className }: AvatarCanvasProps) => {
  return (
    <AvatarChatProvider>
      <div className={className}>
        <Loader />
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <AvatarExperience modelPath={modelPath} />
        </Canvas>
      </div>
    </AvatarChatProvider>
  );
};
