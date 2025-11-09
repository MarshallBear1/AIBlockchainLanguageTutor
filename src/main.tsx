import { createRoot } from "react-dom/client";
import { useGLTF } from "@react-three/drei";
import App from "./App.tsx";
import "./index.css";

// Preload avatar models for faster loading
useGLTF.preload("/models/64f1a714fe61576b46f27ca2.glb");
useGLTF.preload("/models/animations.glb");

createRoot(document.getElementById("root")!).render(<App />);
