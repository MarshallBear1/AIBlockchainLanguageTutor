import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TokiMascot from "@/components/TokiMascot";

const greetings = ["Bonjour!", "Hola!", "Ciao!", "Olá!", "こんにちは!", "안녕하세요!", "你好!"];

const Welcome = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setGreeting(randomGreeting);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-2">{greeting}</h1>
        
        <TokiMascot state="idle" size="lg" />
        
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-foreground">Toki</h2>
          <p className="text-lg text-muted-foreground">Your AI Language Partner</p>
        </div>

        <Button 
          onClick={() => navigate("/select-language")}
          className="w-full h-12 text-lg"
          size="lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
