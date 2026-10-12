# LevelBridge

> **Teach Every Child at the Right Level.**  
> LevelBridge is an offline-capable, open-source educational platform designed to help a single teacher instruct students across diverse learning levels in the same classroom.

LevelBridge pinpoints each student's real mastery level through a short, deterministic adaptive diagnostic, traces failures to the earliest missing prerequisite foundation, dynamically clusters the class into ability groups, and generates a structured 45-minute lesson plan for one teacher.

---

## 🌟 Key Features

1. **Three Core Subjects with 10-Level Continuous Ladders**:
   - **Maths**: Numbers to 99, 2-digit subtraction, multiplication tables, division, fractions & decimals, factors & ratios, percentages & simple equations, algebraic expressions, linear equations, and quadratic factorisation & Pythagoras.
   - **English**: Letters & phonics, simple sentences, nouns & verbs, adjectives & pronouns, tenses & prepositions, subject-verb agreement, active/passive voice, reported speech, complex sentences, and tone/cohesion/comprehension (with original reading passages).
   - **Science**: Living & non-living, habitats & diets, plant parts & nutrients, states of matter & adaptations, digestion & simple machines, mixture separation & motion, acids & heat transfer, force & cell biology, atoms & tissues, and chemical reactions & electricity.

2. **Adaptive Diagnostic Engine (Rules, Not AI)**:
   - Starts at the student's enrolled class level (Class 3 to 10).
   - 2 consecutive correct answers move up a level; 2 consecutive incorrect answers drop down.
   - Traces failures back through prerequisite DAGs to identify hidden foundational gaps (Class 1–2).
   - Deterministic and explainable: every placement decision can be defended without black-box models.

3. **Multi-Level Ability Grouping & 45-Minute Lesson Plan**:
   - Deterministically clusters students into up to 4 ability groups.
   - **Mixed Class Mode**: Groups students by skill level regardless of nominal grade, never pushing a child above their tested level.
   - Generates a visual 45-minute schedule dividing direct teacher instruction and concurrent peer/independent practice tasks.

4. **Dual Age-Appropriate Visual Styles**:
   - **Primary (Class 3–5)**: Tactile, friendly animal avatars, large vibrant buttons, and playful encouragement.
   - **Secondary / Teen (Class 6–10)**: Clean initial circle badges, focused card options with letter chips (A–D), and calm, encouraging feedback.
   - Respectful *"A foundation to strengthen first"* cards when a secondary student has a gap in elementary skills.

5. **100% Offline by Default**:
   - Bundled with React, Vite, Tailwind CSS 3, Dexie (IndexedDB), and Recharts.
   - Works completely without internet connectivity.

6. **Local Open-Source AI Co-Pilot (Optional)**:
   - Integrates with local **Gemma 2B** via **Ollama** (`http://localhost:11434`) for kid-friendly story explanations and remedial teacher activities.
   - Purely optional: includes built-in offline pedagogical fallbacks when Ollama is not running.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/sherwinmoses01/LevelBridge.git
cd LevelBridge

# Install dependencies
npm install
```

### 2. Run Locally

```bash
# Start Vite development server
npm run dev
```

Open your browser at the displayed localhost URL (e.g., `http://localhost:5173/`).

### 3. Run Test Suite

```bash
# Run unit & diagnostic simulation tests
npm test
```

### 4. Production Build

```bash
npm run build
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3
- **Local Storage**: Dexie.js (IndexedDB)
- **Visual Analytics**: Recharts
- **Rules Engine**: Plain JavaScript (deterministic diagnostic tree & topological prerequisite DAG)
- **Local AI Helper**: Local Ollama (Gemma 2B / Gemma 2 / Llama) via `/ollama` reverse proxy with offline fallbacks

---

## 👥 Demo Profiles

- **Student Login**: Select any class between **Class 3** and **Class 10**. Enter any student name (e.g., `Arjun`, `Maya`).
- **Teacher Login**: Switch to *"I'm a teacher"*, enter any name (e.g., `Ms. Sharma`), and enter demo PIN: `1234`.

---

## 📄 Note for Teachers & Judges

*LevelBridge starter questions and activities are demonstrative content written to showcase deterministic adaptive placement and classroom orchestration. Always review content against your institution's specific syllabus before classroom administration.*
