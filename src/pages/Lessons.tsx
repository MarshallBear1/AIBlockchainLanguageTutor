import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const lessons = [
  { id: "intro", emoji: "👋", title: "Introductions", category: "Beginner" },
  { id: "routine", emoji: "☀️", title: "Daily Routine", category: "Beginner" },
  { id: "family", emoji: "👨‍👩‍👧‍👦", title: "Family", category: "Beginner" },
  { id: "restaurant", emoji: "🍽️", title: "At the Restaurant", category: "Food" },
  { id: "coffee", emoji: "☕", title: "Ordering Coffee", category: "Food" },
  { id: "airport", emoji: "✈️", title: "At the Airport", category: "Travel" },
  { id: "hotel", emoji: "🏨", title: "Hotel Check-in", category: "Travel" },
  { id: "friends", emoji: "🤝", title: "Making Friends", category: "Life" },
];

const categories = ["All", "Beginner", "Life", "Food", "Travel", "Business"];

const Lessons = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredLessons = selectedCategory === "All" 
    ? lessons 
    : lessons.filter(l => l.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Choose lesson</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Custom Lesson Card */}
        <Card 
          className="p-6 bg-gradient-to-br from-primary to-secondary text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/custom-lesson")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">✨ Custom Lesson</h3>
              <p className="text-white/90">Learn grammar tips or discuss any topic</p>
            </div>
            <Button variant="secondary" size="sm">Start</Button>
          </div>
        </Card>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Lesson Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              onClick={() => navigate(`/conversation?lesson=${lesson.id}`)}
              className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="text-4xl mb-2">{lesson.emoji}</div>
              <h3 className="font-semibold mb-2">{lesson.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {lesson.category}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lessons;
