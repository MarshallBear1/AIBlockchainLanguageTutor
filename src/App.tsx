import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import SelectLanguage from "./pages/SelectLanguage";
import SelectLevel from "./pages/SelectLevel";
import Setup from "./pages/Setup";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import CustomLesson from "./pages/CustomLesson";
import Conversation from "./pages/Conversation";
import Roleplay from "./pages/Roleplay";
import Vocab from "./pages/Vocab";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/select-language" element={<SelectLanguage />} />
          <Route path="/select-level" element={<SelectLevel />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/custom-lesson" element={<CustomLesson />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/roleplay" element={<Roleplay />} />
          <Route path="/vocab" element={<Vocab />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
