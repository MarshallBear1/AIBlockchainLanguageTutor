import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import SelectLanguage from "./pages/SelectLanguage";
import SelectLevel from "./pages/SelectLevel";
import SelectAvatar from "./pages/SelectAvatar";
import Setup from "./pages/Setup";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import CustomLesson from "./pages/CustomLesson";
import Conversation from "./pages/Conversation";
import LiveConversationPage from "./pages/LiveConversation";
import Roleplay from "./pages/Roleplay";
import Vocab from "./pages/Vocab";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/select-language" element={<SelectLanguage />} />
          <Route path="/select-level" element={<SelectLevel />} />
          <Route path="/select-avatar" element={<SelectAvatar />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
          <Route path="/custom-lesson" element={<ProtectedRoute><CustomLesson /></ProtectedRoute>} />
          <Route path="/conversation" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
          <Route path="/live-conversation" element={<ProtectedRoute><LiveConversationPage /></ProtectedRoute>} />
          <Route path="/roleplay" element={<ProtectedRoute><Roleplay /></ProtectedRoute>} />
          <Route path="/vocab" element={<ProtectedRoute><Vocab /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
