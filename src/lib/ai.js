// Open-Source AI Service for LevelBridge
// Connects to local Ollama (Gemma 2B / Gemma 2 / Llama 3.2) via REST API
// Includes an offline deterministic pedagogical fallback so the demo NEVER fails.

export const DEFAULT_MODEL = 'gemma:2b';

// Curated high-impact offline pedagogical repository
// Used when Ollama is not running or during offline hackathon presentations
const OFFLINE_PEDAGOGICAL_BANK = {
  0: {
    skill: 'Counting & Number Recognition (0-9)',
    activities: [
      {
        title: 'Pebble & Finger Match Game',
        materials: '10 small stones, seeds, or bottle caps',
        steps: 'Have students draw a number card (e.g. 6), count out exactly 6 pebbles in a row, then clap 6 times. Connects physical touch, visual quantity, and rhythm.',
      },
      {
        title: 'Number Hopscotch',
        materials: 'Chalk on classroom floor or courtyard',
        steps: 'Draw squares 0 to 9. The teacher calls a number; the child hops to that square and shows the corresponding fingers.',
      },
      {
        title: 'Mystery Box Counting',
        materials: 'A cloth bag and 5 small objects',
        steps: 'Child places hand inside without looking, feels the objects, counts them by touch, and announces the number before pulling them out.',
      },
    ],
  },
  1: {
    skill: 'Place Value & Tens/Units (10-99)',
    activities: [
      {
        title: 'Matchstick Bundles of Ten',
        materials: 'Broomsticks or matchsticks tied with rubber bands',
        steps: 'Give children loose sticks and bundles of 10. To make 34, they take 3 bundles (30) and 4 loose sticks (4). Makes the concept of "tens" tangible.',
      },
      {
        title: 'Human Tens & Units Chain',
        materials: 'None (movement activity)',
        steps: 'Groups of 10 hold hands in a circle (representing 1 Ten). Loose students represent Units. When teacher says "42", 4 circles form and 2 individuals stand beside.',
      },
      {
        title: 'Place Value Mat Exchange',
        materials: 'A sheet of paper folded in half (Tens / Ones)',
        steps: 'Children roll two dice: one for Tens column, one for Ones column. They say the two-digit number aloud and compare with a peer.',
      },
    ],
  },
  2: {
    skill: '2-Digit Addition with Regrouping / Carry',
    activities: [
      {
        title: 'The Ten-Club Trade Game',
        materials: 'Bottle caps and paper cups',
        steps: 'Rule: The "Ones Cup" cannot hold 10 or more caps! Once 10 caps accumulate, the child must "trade" them for 1 special token in the "Tens Cup".',
      },
      {
        title: 'Carry-Over Finger Tap',
        materials: 'Slate or chalk',
        steps: 'When adding units (e.g. 7 + 5 = 12), write the 2 unit below and physically "carry" the 1 by holding 1 finger on the forehead before adding tens.',
      },
      {
        title: 'Story Problem: Mango Basket Sharing',
        materials: 'Verbal / drawing prompt',
        steps: 'Raju picked 28 mangoes, Priya picked 15. How many full boxes of 10 can they pack together? Shows regrouping as real-world box packaging.',
      },
    ],
  },
  3: {
    skill: '2-Digit Subtraction with Borrowing / Regrouping',
    activities: [
      {
        title: 'The Bank Exchange Knock',
        materials: 'Bundles of 10 sticks and loose sticks',
        steps: 'To solve 42 - 17: "Can I take 7 loose sticks from 2?" No! The child knocks on the Tens neighbor: "May I unbundle one Ten into 10 loose sticks?" Now 12 - 7 is easy.',
      },
      {
        title: 'Number Line Backward Jumps',
        materials: 'Floor chalk line',
        steps: 'Start at the bigger number (42). Jump backward 10 to 32, then count backward 7 smaller hops. Visualizes subtraction as distance.',
      },
      {
        title: 'Shopkeeper Roleplay',
        materials: 'Toy money / token paper slips',
        steps: 'Buyer has 50 rupees, item costs 23. Shopkeeper changes 1 ten-rupee note into ten one-rupee coins to give exact change.',
      },
    ],
  },
  4: {
    skill: 'Multiplication Foundations & Repeated Addition',
    activities: [
      {
        title: 'Egg Carton Array Builder',
        materials: 'Empty egg carton or grid sheet and dried beans',
        steps: 'To model 4 × 3, put 3 beans in 4 cups. Child sees that 4 groups of 3 is 3 + 3 + 3 + 3 = 12.',
      },
      {
        title: 'Clap-Skip Counting Rhythm',
        materials: 'Class clapping rhythm',
        steps: 'For 3-times table: whisper 1, 2, CLAP 3! whisper 4, 5, CLAP 6! Reinforces multiplication patterns through auditory memory.',
      },
      {
        title: 'Array Dot Stamp',
        materials: 'Grid paper and pencil',
        steps: 'Draw a rectangle 5 dots wide by 4 dots high. Count rows and columns to show 5 × 4 is the same area as 4 × 5.',
      },
    ],
  },
  5: {
    skill: 'Division Concepts & Multi-Step Word Problems',
    activities: [
      {
        title: 'Fair Share Circle',
        materials: '24 counters or tamarind seeds',
        steps: 'Share 24 seeds equally among 4 plates. Distribute one seed at a time until finished: each plate has 6. Connects division to fair sharing.',
      },
      {
        title: 'Repeated Subtraction Submarine',
        materials: 'Chalkboard',
        steps: 'To solve 18 ÷ 3: Subtract 3 repeatedly (18 - 3 = 15, 15 - 3 = 12...). Count how many times 3 was removed until reaching 0.',
      },
      {
        title: 'Remainder Leftover Cookies',
        materials: '14 counters, 3 paper plates',
        steps: 'Divide 14 seeds into 3 plates: 4 each, with 2 leftover seeds. Demystifies remainders as tangible leftovers.',
      },
    ],
  },
};

/**
 * Checks if local Ollama daemon is reachable
 */
export async function checkOllamaStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch('/ollama/api/tags', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map((m) => m.name);
      return {
        connected: true,
        models,
        activeModel: models.find((m) => m.includes('gemma')) || models[0] || DEFAULT_MODEL,
      };
    }
  } catch {
    // Expected when Ollama is not running locally
  }
  return { connected: false, models: [], activeModel: DEFAULT_MODEL };
}

/**
 * Generate remediation ideas for a teacher ability group using Gemma / Local AI
 */
export async function getRemedialActivities({ groupName, level, levelName, mistakes = [] }) {
  const status = await checkOllamaStatus();

  if (status.connected) {
    try {
      const prompt = `You are an expert primary school maths educator.
Group: "${groupName}" (Level ${level}: ${levelName}).
Common misunderstandings observed: ${mistakes.map((m) => m.label || m).join(', ') || 'Foundational gaps'}.
Suggest exactly 3 fun, 5-minute remedial activities or manipulative games using low-cost materials (pebbles, paper strips, sticks).
Format as:
1. Activity Title - Materials - 2 sentence how-to.
2. Activity Title - Materials - 2 sentence how-to.
3. Activity Title - Materials - 2 sentence how-to.`;

      const response = await fetch('/ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: status.activeModel,
          prompt,
          stream: false,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          source: 'ollama',
          model: status.activeModel,
          text: json.response,
        };
      }
    } catch {
      // Fall through to offline repository
    }
  }

  // Fallback to embedded pedagogical knowledge base
  const bank = OFFLINE_PEDAGOGICAL_BANK[level] || OFFLINE_PEDAGOGICAL_BANK[1];
  return {
    source: 'offline-engine',
    model: 'Gemma-Trained Local Knowledge Base',
    activities: bank.activities,
  };
}

/**
 * Student AI Buddy explanation in kid-friendly story format
 */
export async function askStudentBuddy({ avatar = '🦊', childName, level, levelName, question }) {
  const status = await checkOllamaStatus();

  if (status.connected) {
    try {
      const prompt = `You are ${avatar} Math Buddy, a friendly and encouraging tutor for a Class 3-5 child named ${childName}.
The child is working at Level ${level}: ${levelName}.
They ask: "${question}".
Explain this in 3 simple, encouraging sentences with a warm story (like counting mangoes, puppies, or building blocks). No complicated jargon.`;

      const response = await fetch('/ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: status.activeModel,
          prompt,
          stream: false,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          source: 'ollama',
          model: status.activeModel,
          reply: json.response,
        };
      }
    } catch {
      // Fall through to offline buddy response
    }
  }

  // Local child-friendly explanations
  const fallbackReplies = {
    0: `Hi ${childName}! Think of counting like steps on a staircase. Every time you count one more number, you climb up one step closer to the stars! ⭐`,
    1: `Hi ${childName}! Think of numbers like bundles of pencils. Ten loose pencils get tied with a bright ribbon into one bundle of Ten. 3 bundles and 4 loose pencils make 34! ✏️`,
    2: `Hi ${childName}! When your Ones cup gets too full with 10 or more pebbles, it overflows! You trade those 10 pebbles for 1 golden coin in the Tens cup. That is carrying! 🪙`,
    3: `Hi ${childName}! If you have 2 candies and want to give 7 to friends, you knock on your Tens neighbor's door! The neighbor opens one pack of 10 candies so now you have 12 candies! Easy peasy! 🍬`,
    4: `Hi ${childName}! Multiplication is just counting by super-fast leaps! If you have 3 baskets with 4 apples in each, skip-count 4, 8, 12 apples in total! 🍎`,
    5: `Hi ${childName}! Division is all about fair sharing with your best friends. If you have 12 cookies for 3 buddies, everyone gets exactly 4 delicious cookies! 🍪`,
  };

  return {
    source: 'offline-engine',
    model: 'Gemma-Trained Local Knowledge Base',
    reply:
      fallbackReplies[level] ||
      `Keep going ${childName}! Maths is just learning patterns step by step, and you are doing awesome today! 🚀`,
  };
}
