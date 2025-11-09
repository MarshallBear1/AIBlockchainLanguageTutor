import { CameraControls, ContactShadows, Environment, Text, Html } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAvatarChat } from "@/hooks/useAvatarChat";
import { Avatar3D } from "./Avatar3D";
import TokiMascot from "@/components/TokiMascot";

const LoadingFallback = () => {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <TokiMascot state="flicker" size="lg" />
      </div>
    </Html>
  );
};

const LoadingDots = (props: any) => {
  const avatarChat = useAvatarChat();
  const loading = avatarChat?.loading || false;
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((prev) => {
          if (prev.length > 2) {
            return ".";
          }
          return prev + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"} color="black" {...({} as any)}>
        {loadingText}
      </Text>
    </group>
  );
};

interface AvatarExperienceProps {
  modelPath?: string;
  initialZoom?: boolean;
}

export const AvatarExperience = ({ modelPath, initialZoom = false }: AvatarExperienceProps) => {
  const cameraControls = useRef<CameraControls>(null);
  const avatarChat = useAvatarChat();
  const cameraZoomed = avatarChat?.cameraZoomed || false;

  useEffect(() => {
    if (cameraControls.current) {
      // Use closer camera position for live conversation
      const distance = initialZoom ? 3 : 5;
      cameraControls.current.setLookAt(0, 2, distance, 0, 1.5, 0);
    }
  }, [initialZoom]);

  useEffect(() => {
    if (!cameraControls.current) return;

    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      <Suspense fallback={<LoadingFallback />}>
        <LoadingDots position-y={1.75} position-x={-0.02} />
        <Avatar3D modelPath={modelPath} />
      </Suspense>
      <ContactShadows opacity={0.7} {...({} as any)} />
    </>
  );
};
