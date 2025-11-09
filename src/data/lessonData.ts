export interface Lesson {
  id: number;
  unitId: number;
  level: number;
  title: string;
  scenario: string;
  description: string;
  emoji: string;
  completed: boolean;
  locked: boolean;
}

export interface Unit {
  id: number;
  level: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

// Roleplay scenarios for lessons
export const units: Unit[] = [
  // ============ LEVEL 1: BEGINNER ============
  {
    id: 1,
    level: 1,
    title: "Unit 1: First Words",
    description: "Learn the basics of greeting and introducing yourself",
    lessons: [
      {
        id: 1,
        unitId: 1,
        level: 1,
        title: "How to say your name",
        scenario: "Practice introducing yourself with '¿Cómo te llamas?' and 'Me llamo...'",
        description: "Your first Spanish phrase",
        emoji: "👋",
        completed: false,
        locked: false,
      },
      {
        id: 2,
        unitId: 1,
        level: 1,
        title: "Morning greetings",
        scenario: "Learn to say 'Buenos días' and when to use it",
        description: "Say good morning",
        emoji: "🌅",
        completed: false,
        locked: true,
      },
      {
        id: 3,
        unitId: 1,
        level: 1,
        title: "Afternoon & evening",
        scenario: "Practice 'Buenas tardes' and 'Buenas noches'",
        description: "Greet at different times",
        emoji: "🌆",
        completed: false,
        locked: true,
      },
      {
        id: 4,
        unitId: 1,
        level: 1,
        title: "How are you?",
        scenario: "Ask '¿Cómo estás?' in conversation",
        description: "Check on someone",
        emoji: "😊",
        completed: false,
        locked: true,
      },
      {
        id: 5,
        unitId: 1,
        level: 1,
        title: "Responding to greetings",
        scenario: "Say 'Bien, gracias', 'Regular', or 'Mal'",
        description: "Answer how you feel",
        emoji: "💭",
        completed: false,
        locked: true,
      },
    ],
  },
  {
    id: 2,
    level: 1,
    title: "Unit 2: Basic Conversations",
    description: "Simple phrases for everyday interactions",
    lessons: [
      {
        id: 6,
        unitId: 2,
        level: 1,
        title: "Where are you from?",
        scenario: "Practice '¿De dónde eres?' and 'Soy de...'",
        description: "Talk about your origin",
        emoji: "🌍",
        completed: false,
        locked: true,
      },
      {
        id: 7,
        unitId: 2,
        level: 1,
        title: "Yes, No, Please, Thank you",
        scenario: "Use 'Sí', 'No', 'Por favor', 'Gracias'",
        description: "Essential polite words",
        emoji: "🙏",
        completed: false,
        locked: true,
      },
      {
        id: 8,
        unitId: 2,
        level: 1,
        title: "Nice to meet you",
        scenario: "Say 'Mucho gusto' or 'Encantado/a'",
        description: "Express pleasure meeting someone",
        emoji: "🤝",
        completed: false,
        locked: true,
      },
      {
        id: 9,
        unitId: 2,
        level: 1,
        title: "Goodbye phrases",
        scenario: "Learn 'Adiós', 'Hasta luego', 'Hasta mañana'",
        description: "Say goodbye properly",
        emoji: "👋",
        completed: false,
        locked: true,
      },
      {
        id: 10,
        unitId: 2,
        level: 1,
        title: "Unit Review: Meeting someone",
        scenario: "Practice a full introduction conversation",
        description: "Put it all together",
        emoji: "⭐",
        completed: false,
        locked: true,
      },
    ],
  },
  
  // ============ LEVEL 2: SURVIVAL ============
  {
    id: 3,
    level: 2,
    title: "Unit 1: Travel Essentials",
    description: "Navigate everyday situations abroad",
    lessons: [
      {
        id: 11,
        unitId: 3,
        level: 2,
        title: "Coffee Shop",
        scenario: "Order your favorite drink and chat with the barista",
        description: "Learn ordering basics",
        emoji: "☕",
        completed: false,
        locked: true,
      },
      {
        id: 12,
        unitId: 3,
        level: 2,
        title: "At the Store",
        scenario: "Buy groceries and ask for help",
        description: "Shopping vocabulary",
        emoji: "🛒",
        completed: false,
        locked: true,
      },
      {
        id: 13,
        unitId: 3,
        level: 2,
        title: "Asking Directions",
        scenario: "Find your way around town",
        description: "Navigate with confidence",
        emoji: "🗺️",
        completed: false,
        locked: true,
      },
      {
        id: 14,
        unitId: 3,
        level: 2,
        title: "Restaurant",
        scenario: "Order a meal at a local restaurant",
        description: "Food vocabulary",
        emoji: "🍽️",
        completed: false,
        locked: true,
      },
      {
        id: 15,
        unitId: 3,
        level: 2,
        title: "Public Transport",
        scenario: "Buy tickets and ask about routes",
        description: "Travel by bus or train",
        emoji: "🚇",
        completed: false,
        locked: true,
      },
    ],
  },

  // ============ LEVEL 3: CONVERSATIONAL ============
  {
    id: 4,
    level: 3,
    title: "Unit 1: Social Life",
    description: "Connect with others naturally",
    lessons: [
      {
        id: 16,
        unitId: 4,
        level: 3,
        title: "Making Plans",
        scenario: "Arrange to meet with friends",
        description: "Time and scheduling",
        emoji: "📅",
        completed: false,
        locked: true,
      },
      {
        id: 17,
        unitId: 4,
        level: 3,
        title: "Movie Night",
        scenario: "Discuss films and make recommendations",
        description: "Share opinions",
        emoji: "🎬",
        completed: false,
        locked: true,
      },
      {
        id: 18,
        unitId: 4,
        level: 3,
        title: "Weekend Plans",
        scenario: "Share what you did and will do",
        description: "Past and future tenses",
        emoji: "🌅",
        completed: false,
        locked: true,
      },
      {
        id: 19,
        unitId: 4,
        level: 3,
        title: "At the Gym",
        scenario: "Talk about fitness and health",
        description: "Sports vocabulary",
        emoji: "💪",
        completed: false,
        locked: true,
      },
      {
        id: 20,
        unitId: 4,
        level: 3,
        title: "Birthday Party",
        scenario: "Celebrate with friends",
        description: "Celebrations and wishes",
        emoji: "🎉",
        completed: false,
        locked: true,
      },
    ],
  },

  // ============ LEVEL 4: PROFICIENT ============
  {
    id: 5,
    level: 4,
    title: "Unit 1: Professional Life",
    description: "Navigate work and academic settings",
    lessons: [
      {
        id: 21,
        unitId: 5,
        level: 4,
        title: "Job Interview",
        scenario: "Answer interview questions confidently",
        description: "Professional vocabulary",
        emoji: "💼",
        completed: false,
        locked: true,
      },
      {
        id: 22,
        unitId: 5,
        level: 4,
        title: "Office Meeting",
        scenario: "Participate in team discussions",
        description: "Business communication",
        emoji: "👔",
        completed: false,
        locked: true,
      },
      {
        id: 23,
        unitId: 5,
        level: 4,
        title: "Presentation",
        scenario: "Present your ideas clearly",
        description: "Public speaking",
        emoji: "📊",
        completed: false,
        locked: true,
      },
      {
        id: 24,
        unitId: 5,
        level: 4,
        title: "Networking Event",
        scenario: "Make professional connections",
        description: "Networking skills",
        emoji: "🤝",
        completed: false,
        locked: true,
      },
      {
        id: 25,
        unitId: 5,
        level: 4,
        title: "Client Call",
        scenario: "Handle customer inquiries",
        description: "Customer service",
        emoji: "☎️",
        completed: false,
        locked: true,
      },
    ],
  },

  // ============ LEVEL 5: FLUENT ============
  {
    id: 6,
    level: 5,
    title: "Unit 1: Native Fluency",
    description: "Master nuanced conversations",
    lessons: [
      {
        id: 26,
        unitId: 6,
        level: 5,
        title: "Cultural Discussion",
        scenario: "Debate cultural topics and traditions",
        description: "Deep conversations",
        emoji: "🎭",
        completed: false,
        locked: true,
      },
      {
        id: 27,
        unitId: 6,
        level: 5,
        title: "Current Events",
        scenario: "Discuss news and politics",
        description: "Advanced vocabulary",
        emoji: "📰",
        completed: false,
        locked: true,
      },
      {
        id: 28,
        unitId: 6,
        level: 5,
        title: "Literary Analysis",
        scenario: "Analyze books and poetry",
        description: "Sophisticated language",
        emoji: "📚",
        completed: false,
        locked: true,
      },
      {
        id: 29,
        unitId: 6,
        level: 5,
        title: "Humor & Wordplay",
        scenario: "Understand and use jokes and idioms",
        description: "Native-level nuance",
        emoji: "😄",
        completed: false,
        locked: true,
      },
      {
        id: 30,
        unitId: 6,
        level: 5,
        title: "Regional Variations",
        scenario: "Explore dialects and local expressions",
        description: "Cultural depth",
        emoji: "🌎",
        completed: false,
        locked: true,
      },
    ],
  },
];

// Helper function to get user progress
export function getUserProgress(): {
  completedLessons: number[];
  currentLesson: number;
} {
  const saved = localStorage.getItem("lessonProgress");
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    completedLessons: [],
    currentLesson: 1,
  };
}

// Helper function to save progress
export function saveProgress(completedLessons: number[], currentLesson: number) {
  localStorage.setItem(
    "lessonProgress",
    JSON.stringify({ completedLessons, currentLesson })
  );
}

// Helper function to unlock next lesson
export function completeLesson(lessonId: number) {
  const progress = getUserProgress();
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }
  progress.currentLesson = lessonId + 1;
  saveProgress(progress.completedLessons, progress.currentLesson);
}

// Get units with progress applied, filtered by user level
export function getUnitsWithProgress(userLevel?: number): Unit[] {
  const progress = getUserProgress();
  const level = userLevel || parseInt(localStorage.getItem("selectedLevel") || "1");
  
  // Filter units by level
  const levelUnits = units.filter(u => u.level === level);

  return levelUnits.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => ({
      ...lesson,
      completed: progress.completedLessons.includes(lesson.id),
      locked: lesson.id > progress.currentLesson,
    })),
  }));
}
