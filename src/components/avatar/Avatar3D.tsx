import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAvatarChat } from "@/hooks/useAvatarChat";
import { facialExpressions } from "@/config/avatarConfig";
import { FacialExpression } from "@/types/avatar";
import { lipsyncManager } from "@/lib/lipsyncManager";
import { VISEMES } from "wawa-lipsync";

interface Avatar3DProps {
  modelPath?: string;
}

export function Avatar3D({ modelPath = "/models/64f1a714fe61576b46f27ca2.glb" }: Avatar3DProps) {
  const { nodes, materials, scene } = useGLTF(modelPath) as any;
  const { message, onMessagePlayed } = useAvatarChat();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [blink, setBlink] = useState(false);
  const [facialExpression, setFacialExpression] = useState<FacialExpression>("default");
  const [animation, setAnimation] = useState("Idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load animations
  const { animations } = useGLTF("/models/animations.glb") as any;
  const group = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, group);

  // Handle new messages
  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      setAudio(null);
      return;
    }

    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);

    // Play audio if provided
    if (message.audio) {
      const audioElement = new Audio("data:audio/mp3;base64," + message.audio);

      // Connect audio to lipsync manager
      audioElement.addEventListener('loadeddata', () => {
        lipsyncManager.connectAudio(audioElement);
      });

      audioElement.play();
      setAudio(audioElement);
      audioRef.current = audioElement;

      audioElement.onended = () => {
        setAudio(null);
        audioRef.current = null;
        onMessagePlayed();
      };
    } else {
      // If no audio, just play message for a few seconds
      setTimeout(onMessagePlayed, 3000);
    }
  }, [message, onMessagePlayed]);

  // Handle animation changes
  useEffect(() => {
    if (actions[animation]) {
      actions[animation]
        .reset()
        .fadeIn(0.5)
        .play();
      return () => {
        actions[animation]?.fadeOut(0.5);
      };
    }
  }, [animation, actions, mixer]);

  // Lerp morph targets for smooth transitions
  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child: any) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index === undefined || child.morphTargetInfluences[index] === undefined) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
      }
    });
  };

  // Animation frame updates
  useFrame(() => {
    if (!nodes.EyeLeft) return;

    // Apply facial expressions
    Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
      const mapping = facialExpressions[facialExpression];
      if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
        return; // Handle blinking separately
      }
      if (mapping && mapping[key]) {
        lerpMorphTarget(key, mapping[key], 0.1);
      } else {
        lerpMorphTarget(key, 0, 0.1);
      }
    });

    // Handle blinking
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    // Handle lip sync with wawa-lipsync
    if (audio && audioRef.current && !audioRef.current.paused) {
      // Process audio for viseme detection
      lipsyncManager.processAudio();
      const currentViseme = lipsyncManager.viseme;

      // Apply current viseme
      lerpMorphTarget(currentViseme, 1, 0.2);

      // Reset all other visemes
      Object.values(VISEMES).forEach((viseme) => {
        if (viseme !== currentViseme) {
          lerpMorphTarget(viseme, 0, 0.1);
        }
      });
    } else {
      // Reset all visemes when not speaking
      Object.values(VISEMES).forEach((viseme) => {
        lerpMorphTarget(viseme, 0, 0.1);
      });
    }
  });

  // Automatic blinking
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  if (!nodes.Hips) {
    return null; // Model not loaded yet
  }

  return (
    <group dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body?.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body?.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom?.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom?.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear?.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear?.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top?.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top?.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair?.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair?.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft?.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft?.skeleton}
        morphTargetDictionary={nodes.EyeLeft?.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft?.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight?.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight?.skeleton}
        morphTargetDictionary={nodes.EyeRight?.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight?.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head?.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head?.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head?.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head?.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth?.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth?.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth?.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth?.morphTargetInfluences}
      />
    </group>
  );
}

// Preload models
useGLTF.preload("/models/64f1a714fe61576b46f27ca2.glb");
useGLTF.preload("/models/animations.glb");
