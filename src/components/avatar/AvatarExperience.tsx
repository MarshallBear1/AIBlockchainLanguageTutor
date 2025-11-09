import { CameraControls, ContactShadows, Environment, Text, Html } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAvatarChat } from "@/hooks/useAvatarChat";
import { Avatar3D } from "./Avatar3D";

const LoadingFallback = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-foreground font-medium">Loading your teacher...</p>
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
}

export const AvatarExperience = ({ modelPath }: AvatarExperienceProps) => {
  const cameraControls = useRef<CameraControls>(null);
  const avatarChat = useAvatarChat();
  const cameraZoomed = avatarChat?.cameraZoomed || false;

  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
    }
  }, []);

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
