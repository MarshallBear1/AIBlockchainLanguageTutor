export interface VocabularyItem {
  word: string;
  translation: string;
  category: 'greeting' | 'question' | 'answer' | 'phrase' | 'verb' | 'noun';
}

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
  learningGoals?: string[]; // Specific goals for the lesson
  vocabulary?: VocabularyItem[]; // Key vocabulary for this lesson
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
        scenario: "Practice asking someone's name and introducing yourself",
        description: "Your first phrase",
        emoji: "👋",
        completed: false,
        locked: false,
        learningGoals: [
          "Student can say 'My name is [their name]' in the target language",
          "Student can ask someone else for their name"
        ],
        vocabulary: [
          { word: "Me llamo", translation: "My name is", category: "phrase" },
          { word: "¿Cómo te llamas?", translation: "What's your name?", category: "question" },
          { word: "Mucho gusto", translation: "Nice to meet you", category: "greeting" },
          { word: "Encantado/a", translation: "Pleased to meet you", category: "greeting" },
        ],
      },
      {
        id: 2,
        unitId: 1,
        level: 1,
        title: "Morning greetings",
        scenario: "Learn to say good morning and when to use it",
        description: "Say good morning",
        emoji: "🌅",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can pronounce good morning correctly",
          "Student knows when to use morning greetings (morning time)",
          "Student can greet someone in the morning naturally",
          "Student understands morning greetings when greeted"
        ],
        vocabulary: [
          { word: "Buenos días", translation: "Good morning", category: "greeting" },
          { word: "Hola", translation: "Hello", category: "greeting" },
          { word: "¿Qué tal?", translation: "How's it going?", category: "question" },
        ],
      },
      {
        id: 3,
        unitId: 1,
        level: 1,
        title: "Afternoon & evening",
        scenario: "Practice saying good afternoon and good evening",
        description: "Greet at different times",
        emoji: "🌆",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can say good afternoon correctly",
          "Student can say good evening correctly",
          "Student knows when to use afternoon vs evening greetings",
          "Student can greet appropriately at different times of day"
        ],
        vocabulary: [
          { word: "Buenas tardes", translation: "Good afternoon", category: "greeting" },
          { word: "Buenas noches", translation: "Good evening/night", category: "greeting" },
          { word: "Hasta luego", translation: "See you later", category: "phrase" },
        ],
      },
      {
        id: 4,
        unitId: 1,
        level: 1,
        title: "How are you?",
        scenario: "Ask how someone is doing in conversation",
        description: "Check on someone",
        emoji: "😊",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can ask 'How are you?' correctly",
          "Student understands the question when asked",
          "Student can use it naturally in conversation",
          "Student knows when to ask how someone is doing"
        ],
        vocabulary: [
          { word: "¿Cómo estás?", translation: "How are you?", category: "question" },
          { word: "Bien", translation: "Good/Well", category: "answer" },
          { word: "Muy bien", translation: "Very good", category: "answer" },
          { word: "¿Y tú?", translation: "And you?", category: "question" },
        ],
      },
      {
        id: 5,
        unitId: 1,
        level: 1,
        title: "Responding to greetings",
        scenario: "Respond with 'good, thanks', 'so-so', or 'not good'",
        description: "Answer how you feel",
        emoji: "💭",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can say 'good, thanks' correctly",
          "Student can say 'so-so' and 'not good'",
          "Student knows which response matches their feeling",
          "Student can respond naturally to 'How are you?'"
        ],
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
        scenario: "Practice asking where someone is from and saying where you're from",
        description: "Talk about your origin",
        emoji: "🌍",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can say 'I am from [their country/city]' in the target language",
          "Student understands when asked where they are from",
          "Student can ask someone where they are from",
          "Student can have a conversation about origins"
        ],
      },
      {
        id: 7,
        unitId: 2,
        level: 1,
        title: "Yes, No, Please, Thank you",
        scenario: "Use yes, no, please, and thank you in conversation",
        description: "Essential polite words",
        emoji: "🙏",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can say yes and no correctly",
          "Student can say please and use it appropriately",
          "Student can say thank you and you're welcome",
          "Student uses polite words naturally in conversation"
        ],
      },
      {
        id: 8,
        unitId: 2,
        level: 1,
        title: "Nice to meet you",
        scenario: "Say 'nice to meet you' and respond appropriately",
        description: "Express pleasure meeting someone",
        emoji: "🤝",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can say 'nice to meet you' correctly",
          "Student understands gender/formality variations if applicable",
          "Student can respond to 'nice to meet you' appropriately",
          "Student uses these phrases naturally when meeting someone"
        ],
      },
      {
        id: 9,
        unitId: 2,
        level: 1,
        title: "Goodbye phrases",
        scenario: "Learn goodbye, see you later, and see you tomorrow",
        description: "Say goodbye properly",
        emoji: "👋",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can say goodbye correctly",
          "Student can say see you later and see you tomorrow",
          "Student knows when to use each goodbye phrase",
          "Student can end conversations appropriately"
        ],
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
        learningGoals: [
          "Student can greet someone appropriately",
          "Student can introduce themselves with name and origin",
          "Student can ask basic questions about the other person",
          "Student can say goodbye naturally"
        ],
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
        learningGoals: [
          "Student can order a drink (e.g., 'I would like a coffee, please')",
          "Student can ask 'How much does it cost?'"
        ],
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
        learningGoals: [
          "Student can ask for items (e.g., 'I need...')",
          "Student can understand prices and quantities",
          "Student can ask 'Where is...?'",
          "Student can complete a shopping transaction"
        ],
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
        learningGoals: [
          "Student can ask 'Where is...?' for locations",
          "Student can understand basic directions (left, right, straight)",
          "Student can ask 'Is it close?'",
          "Student can follow simple direction sequences"
        ],
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
        learningGoals: [
          "Student can read and understand a simple menu",
          "Student can order food (e.g., 'For me...')",
          "Student can ask for the bill",
          "Student can handle a complete restaurant interaction"
        ],
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
        learningGoals: [
          "Student can buy a ticket (e.g., 'One ticket to...')",
          "Student can ask about routes and times",
          "Student can understand platform/gate announcements",
          "Student can navigate public transport independently"
        ],
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
        learningGoals: [
          "Student can suggest activities using future tense",
          "Student can discuss and agree on times/dates",
          "Student can accept or decline invitations naturally",
          "Student can handle plan changes and suggestions"
        ],
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
        learningGoals: [
          "Student can describe movies they've seen (past tense)",
          "Student can give opinions and recommendations",
          "Student can ask about others' movie preferences",
          "Student can discuss genres and actors naturally"
        ],
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
        learningGoals: [
          "Student can talk about past weekend activities",
          "Student can discuss future weekend plans",
          "Student can ask others about their weekends",
          "Student can use past and future tenses naturally in conversation"
        ],
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
        learningGoals: [
          "Student can discuss workout routines and exercises",
          "Student can talk about fitness goals and health",
          "Student can understand gym equipment and instructions",
          "Student can have fitness-related conversations naturally"
        ],
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
        learningGoals: [
          "Student can give birthday wishes and congratulations",
          "Student can discuss party activities and celebrations",
          "Student can talk about gifts and surprises",
          "Student can engage in celebratory conversations naturally"
        ],
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
        scenario: "Answer interview questions about your qualifications",
        description: "Professional vocabulary",
        emoji: "💼",
        completed: false,
        locked: true,
        learningGoals: [
          "Student can say 'I am hardworking' in the target language",
          "Student can say 'I am resourceful' in the target language"
        ],
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
        learningGoals: [
          "Student can present ideas clearly in a meeting",
          "Student can agree or disagree professionally",
          "Student can ask for clarification on business topics",
          "Student can contribute meaningfully to team discussions"
        ],
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
        learningGoals: [
          "Student can structure a professional presentation",
          "Student can use transition phrases effectively",
          "Student can handle questions from the audience",
          "Student can deliver a complete business presentation"
        ],
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
        learningGoals: [
          "Student can introduce themselves professionally",
          "Student can discuss their industry and work",
          "Student can exchange contact information smoothly",
          "Student can maintain professional small talk"
        ],
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
        learningGoals: [
          "Student can handle customer complaints professionally",
          "Student can offer solutions and alternatives",
          "Student can use polite business phone language",
          "Student can complete a professional customer service call"
        ],
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
        learningGoals: [
          "Student can discuss complex cultural concepts with nuance",
          "Student can compare and contrast cultural perspectives",
          "Student can use advanced vocabulary for abstract ideas",
          "Student can engage in native-level cultural discourse"
        ],
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
        learningGoals: [
          "Student can discuss current events with sophisticated language",
          "Student can express political opinions respectfully",
          "Student can analyze and debate complex issues",
          "Student can use journalistic and formal vocabulary"
        ],
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
        learningGoals: [
          "Student can analyze literary themes and symbolism",
          "Student can discuss writing styles and techniques",
          "Student can interpret poetry and metaphorical language",
          "Student can engage in academic literary discourse"
        ],
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
        learningGoals: [
          "Student can understand and tell jokes in target language",
          "Student can use idiomatic expressions naturally",
          "Student can recognize and create wordplay and puns",
          "Student can engage in humorous banter like a native"
        ],
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
        learningGoals: [
          "Student can recognize different regional accents",
          "Student can use region-specific vocabulary and expressions",
          "Student can adapt their language for different regions",
          "Student can discuss linguistic and cultural variations"
        ],
      },
    ],
  },
];

import { supabase } from "@/integrations/supabase/client";

// Helper function to get user progress from database (per language)
export async function getUserProgress(languageCode?: string): Promise<{
  completedLessons: number[];
  currentLesson: number;
}> {
  const defaultProgress = { completedLessons: [], currentLesson: 1 };

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching user in getUserProgress:', userError);
      return defaultProgress;
    }

    if (!user) {
      return defaultProgress;
    }

    // Get language from parameter or localStorage
    const language = languageCode || localStorage.getItem("selectedLanguage") || "es";

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('language_code', language);

    if (error) {
      console.error('Error fetching lesson progress from database:', error);
      return defaultProgress;
    }

    const completedLessons = data?.map(p => p.lesson_id) || [];
    const currentLesson = completedLessons.length > 0
      ? Math.max(...completedLessons) + 1
      : 1;

    return { completedLessons, currentLesson };
  } catch (error) {
    console.error('Unexpected error in getUserProgress:', error);
    return defaultProgress;
  }
}

// Helper function to save lesson completion to database (per language)
export async function completeLesson(lessonId: number, languageCode?: string): Promise<{ success: boolean; coinsEarned: number }> {
  const defaultResult = { success: false, coinsEarned: 0 };

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching user in completeLesson:', userError);
      return defaultResult;
    }

    if (!user) {
      console.warn('No user found in completeLesson');
      return defaultResult;
    }

    // Get language from parameter or localStorage
    const language = languageCode || localStorage.getItem("selectedLanguage") || "es";

    // Save lesson progress with language tracking
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        language_code: language,
        completed: true
      }, {
        onConflict: 'user_id,lesson_id,language_code'
      });

    if (error) {
      console.error('Error saving lesson progress to database:', error);
      return defaultResult;
    }

    // Update streak
    let coinsEarned = 50; // Fixed amount shown to user
    try {
      const { updateStreak } = await import('@/utils/streakManager');
      await updateStreak();
    } catch (error) {
      console.error('Error updating streak in completeLesson:', error);
    }

    // Add VIBE to banked_vibe via edge function
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (authData?.session?.access_token) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-cycle-completion`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.session.access_token}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Lesson ${lessonId} completed! ${result.message}`);
          
          // Dispatch custom event to update UI immediately
          window.dispatchEvent(new CustomEvent('vibeBalanceUpdated'));
        } else {
          console.error('❌ Error banking VIBE:', await response.text());
        }
      }
    } catch (error) {
      console.error('❌ Error calling check-cycle-completion:', error);
    }

    return { success: true, coinsEarned };
  } catch (error) {
    console.error('Unexpected error in completeLesson:', error);
    return defaultResult;
  }
}

// Get units with progress applied, filtered by user level (per language)
export async function getUnitsWithProgress(userLevel?: number, languageCode?: string): Promise<Unit[]> {
  try {
    const progress = await getUserProgress(languageCode);
    const level = userLevel || parseInt(localStorage.getItem("selectedLevel") || "1");

    // Filter units by level
    const levelUnits = units.filter(u => u.level === level);

    return levelUnits.map((unit) => {
      // Get lessons in this unit sorted by id
      const unitLessons = unit.lessons.sort((a, b) => a.id - b.id);

      return {
        ...unit,
        lessons: unitLessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);

          // First lesson of each unit is always unlocked
          if (index === 0) {
            return {
              ...lesson,
              completed: isCompleted,
              locked: false,
            };
          }

          // Other lessons are unlocked only if the previous lesson in the unit is completed
          const previousLesson = unitLessons[index - 1];
          const isPreviousCompleted = progress.completedLessons.includes(previousLesson.id);

          return {
            ...lesson,
            completed: isCompleted,
            locked: !isPreviousCompleted,
          };
        }),
      };
    });
  } catch (error) {
    console.error('Unexpected error in getUnitsWithProgress:', error);
    // Return empty array on error
    return [];
  }
}
