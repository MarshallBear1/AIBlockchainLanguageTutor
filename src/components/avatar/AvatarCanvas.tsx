import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { AvatarExperience } from "./AvatarExperience";
import { Skeleton } from "@/components/ui/skeleton";

interface AvatarCanvasProps {
  modelPath?: string;
  className?: string;
}

export const AvatarCanvas = ({ modelPath, className }: AvatarCanvasProps) => {
  return (
    <div className={className}>
      <Loader 
        containerStyles={{
          backgroundColor: 'hsl(var(--background))',
        }}
        dataStyles={{
          color: 'hsl(var(--primary))',
          fontSize: '14px'
        }}
      />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 42 }}>
        <AvatarExperience modelPath={modelPath} />
      </Canvas>
    </div>
  );
};
