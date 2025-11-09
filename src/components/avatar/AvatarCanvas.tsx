import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { AvatarExperience } from "./AvatarExperience";

interface AvatarCanvasProps {
  modelPath?: string;
  className?: string;
}

export const AvatarCanvas = ({ modelPath, className }: AvatarCanvasProps) => {
  return (
    <div className={className}>
      <Loader />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 42 }}>
        <AvatarExperience modelPath={modelPath} />
      </Canvas>
    </div>
  );
};
