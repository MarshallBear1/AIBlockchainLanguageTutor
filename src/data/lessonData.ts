export interface Lesson {
  id: number;
  unitId: number;
  title: string;
  scenario: string;
  description: string;
  emoji: string;
  completed: boolean;
  locked: boolean;
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

// Roleplay scenarios for lessons
export const units: Unit[] = [
  {
    id: 1,
    title: "Unit 1: Everyday Basics",
    description: "Master essential conversations",
    lessons: [
      {
        id: 1,
        unitId: 1,
        title: "Coffee Shop",
        scenario: "Order your favorite drink and chat with the barista",
        description: "Learn greetings and basic ordering",
        emoji: "☕",
        completed: false,
        locked: false,
      },
      {
        id: 2,
        unitId: 1,
        title: "Meet & Greet",
        scenario: "Introduce yourself to a new friend",
        description: "Practice introductions and small talk",
        emoji: "👋",
        completed: false,
        locked: true,
      },
      {
        id: 3,
        unitId: 1,
        title: "At the Store",
        scenario: "Buy groceries and ask for help",
        description: "Shopping vocabulary and questions",
        emoji: "🛒",
        completed: false,
        locked: true,
      },
      {
        id: 4,
        unitId: 1,
        title: "Asking Directions",
        scenario: "Find your way around town",
        description: "Learn to ask for and give directions",
        emoji: "🗺️",
        completed: false,
        locked: true,
      },
      {
        id: 5,
        unitId: 1,
        title: "Restaurant",
        scenario: "Order a meal at a local restaurant",
        description: "Food vocabulary and polite requests",
        emoji: "🍽️",
        completed: false,
        locked: true,
      },
      {
        id: 6,
        unitId: 1,
        title: "Making Plans",
        scenario: "Arrange to meet with friends",
        description: "Time, dates, and social planning",
        emoji: "📅",
        completed: false,
        locked: true,
      },
      {
        id: 7,
        unitId: 1,
        title: "On the Phone",
        scenario: "Have a phone conversation",
        description: "Phone etiquette and common phrases",
        emoji: "📞",
        completed: false,
        locked: true,
      },
      {
        id: 8,
        unitId: 1,
        title: "Doctor's Visit",
        scenario: "Describe symptoms and understand advice",
        description: "Health and body vocabulary",
        emoji: "🏥",
        completed: false,
        locked: true,
      },
      {
        id: 9,
        unitId: 1,
        title: "Public Transport",
        scenario: "Buy tickets and ask about routes",
        description: "Travel and transportation",
        emoji: "🚇",
        completed: false,
        locked: true,
      },
      {
        id: 10,
        unitId: 1,
        title: "Unit Review",
        scenario: "Practice everything you've learned",
        description: "Mixed conversation challenge",
        emoji: "⭐",
        completed: false,
        locked: true,
      },
    ],
  },
  {
    id: 2,
    title: "Unit 2: Social Life",
    description: "Connect with others",
    lessons: [
      {
        id: 11,
        unitId: 2,
        title: "Birthday Party",
        scenario: "Celebrate with friends",
        description: "Celebrations and wishes",
        emoji: "🎉",
        completed: false,
        locked: true,
      },
      {
        id: 12,
        unitId: 2,
        title: "Movie Night",
        scenario: "Discuss films and make recommendations",
        description: "Entertainment and opinions",
        emoji: "🎬",
        completed: false,
        locked: true,
      },
      {
        id: 13,
        unitId: 2,
        title: "At the Gym",
        scenario: "Talk about fitness and health",
        description: "Sports and exercise vocabulary",
        emoji: "💪",
        completed: false,
        locked: true,
      },
      {
        id: 14,
        unitId: 2,
        title: "Weekend Plans",
        scenario: "Share what you did and will do",
        description: "Past and future tenses",
        emoji: "🌅",
        completed: false,
        locked: true,
      },
      {
        id: 15,
        unitId: 2,
        title: "Book Club",
        scenario: "Discuss your favorite stories",
        description: "Expressing opinions and preferences",
        emoji: "📚",
        completed: false,
        locked: true,
      },
      {
        id: 16,
        unitId: 2,
        title: "Concert",
        scenario: "Talk about music and performances",
        description: "Music and emotions",
        emoji: "🎵",
        completed: false,
        locked: true,
      },
      {
        id: 17,
        unitId: 2,
        title: "Cooking Together",
        scenario: "Share recipes and cooking tips",
        description: "Food preparation vocabulary",
        emoji: "👨‍🍳",
        completed: false,
        locked: true,
      },
      {
        id: 18,
        unitId: 2,
        title: "Game Night",
        scenario: "Play games and have fun",
        description: "Leisure activities",
        emoji: "🎮",
        completed: false,
        locked: true,
      },
      {
        id: 19,
        unitId: 2,
        title: "Compliments & Thanks",
        scenario: "Give and receive compliments",
        description: "Polite expressions",
        emoji: "💝",
        completed: false,
        locked: true,
      },
      {
        id: 20,
        unitId: 2,
        title: "Unit Review",
        scenario: "Social situations challenge",
        description: "Mixed social conversations",
        emoji: "⭐",
        completed: false,
        locked: true,
      },
    ],
  },
  {
    id: 3,
    title: "Unit 3: Work & Study",
    description: "Professional conversations",
    lessons: [
      {
        id: 21,
        unitId: 3,
        title: "Job Interview",
        scenario: "Answer interview questions confidently",
        description: "Professional vocabulary",
        emoji: "💼",
        completed: false,
        locked: true,
      },
      {
        id: 22,
        unitId: 3,
        title: "Office Meeting",
        scenario: "Participate in team discussions",
        description: "Business communication",
        emoji: "👔",
        completed: false,
        locked: true,
      },
      {
        id: 23,
        unitId: 3,
        title: "Email Writing",
        scenario: "Write professional messages",
        description: "Formal writing skills",
        emoji: "📧",
        completed: false,
        locked: true,
      },
      {
        id: 24,
        unitId: 3,
        title: "Client Call",
        scenario: "Handle customer inquiries",
        description: "Customer service",
        emoji: "☎️",
        completed: false,
        locked: true,
      },
      {
        id: 25,
        unitId: 3,
        title: "Study Group",
        scenario: "Collaborate with classmates",
        description: "Academic discussions",
        emoji: "🎓",
        completed: false,
        locked: true,
      },
      {
        id: 26,
        unitId: 3,
        title: "Presentation",
        scenario: "Present your ideas clearly",
        description: "Public speaking",
        emoji: "📊",
        completed: false,
        locked: true,
      },
      {
        id: 27,
        unitId: 3,
        title: "Networking Event",
        scenario: "Make professional connections",
        description: "Networking skills",
        emoji: "🤝",
        completed: false,
        locked: true,
      },
      {
        id: 28,
        unitId: 3,
        title: "Library Research",
        scenario: "Ask for help finding resources",
        description: "Research vocabulary",
        emoji: "📖",
        completed: false,
        locked: true,
      },
      {
        id: 29,
        unitId: 3,
        title: "Performance Review",
        scenario: "Discuss goals and feedback",
        description: "Professional development",
        emoji: "📈",
        completed: false,
        locked: true,
      },
      {
        id: 30,
        unitId: 3,
        title: "Unit Review",
        scenario: "Professional challenge",
        description: "Mixed work situations",
        emoji: "⭐",
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

// Get units with progress applied
export function getUnitsWithProgress(): Unit[] {
  const progress = getUserProgress();

  return units.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => ({
      ...lesson,
      completed: progress.completedLessons.includes(lesson.id),
      locked: lesson.id > progress.currentLesson,
    })),
  }));
}
