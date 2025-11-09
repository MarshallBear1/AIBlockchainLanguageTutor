import { CameraControls, ContactShadows, Environment, Text } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAvatarChat } from "@/hooks/useAvatarChat";
import { Avatar3D } from "./Avatar3D";

const LoadingDots = (props: any) => {
  const { loading } = useAvatarChat();
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
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"} color="black">
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
  const { cameraZoomed } = useAvatarChat();

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
      <Suspense fallback={null}>
        <LoadingDots position-y={1.75} position-x={-0.02} />
      </Suspense>
      <Avatar3D modelPath={modelPath} />
      <ContactShadows opacity={0.7} />
    </>
  );
};
