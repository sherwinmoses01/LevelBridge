// Generator script for LevelBridge 3-subject dataset (Maths, English, Science)
// 10 levels each, 5 questions per level, verified arithmetic, acyclic prerequisites,
// original reading comprehension passages <= 60 words, and rich mistake tags.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Helper to rotate answer placement across options
function makeQuestion({ id, level, prompt, passage = null, answer, wrongsWithTags, answerPos }) {
  const options = [];
  const wrongTags = {};
  const wrongEntries = Object.entries(wrongsWithTags); // [[option, tag], ...]
  let wrongIdx = 0;

  for (let i = 0; i < 4; i++) {
    if (i === answerPos) {
      options.push(String(answer));
    } else {
      const [wOpt, wTag] = wrongEntries[wrongIdx++];
      options.push(String(wOpt));
      wrongTags[String(wOpt)] = wTag;
    }
  }

  const q = { id, level, prompt, options, answer: String(answer), wrongTags };
  if (passage) q.passage = passage;
  return q;
}

// -------------------------------------------------------------
// 1. MATHS DATASET
// -------------------------------------------------------------
const mathsMistakeTags = {
  digits_reversed: {
    label: "Digits swapped",
    explanation: "Look at place values: tens and ones are different columns. 54 is 5 tens and 4 ones, not 45."
  },
  expanded_form_written_together: {
    label: "Wrote expanded form as digits",
    explanation: "When you write fifty-four, 50 and 4 combine into 54 without extra zeros."
  },
  count_offset: {
    label: "Count shifted",
    explanation: "Count one by one carefully to avoid being one ahead or behind."
  },
  add_instead_of_subtract: {
    label: "Added instead of subtracting",
    explanation: "Check the sign: minus (-) means take away, while plus (+) means combine."
  },
  subtracted_smaller_from_larger_digit: {
    label: "Subtracted smaller digit from larger without regrouping",
    explanation: "When subtracting ones, if the bottom digit is bigger, borrow 1 ten from the tens column first."
  },
  borrowing_tens_not_reduced: {
    label: "Forgot to reduce tens after borrowing",
    explanation: "Remember: when you borrow 1 ten, reduce the tens digit by 1 before finishing."
  },
  table_skip_error: {
    label: "Multiplication skip-count off by one step",
    explanation: "Count groups carefully: 6 × 7 means 6 groups of 7, which is 42."
  },
  added_instead_of_multiplied: {
    label: "Added instead of multiplying",
    explanation: "Multiplication means repeated groups, not simply adding the two numbers."
  },
  place_value_shift: {
    label: "Place value column confused",
    explanation: "Check hundreds, tens, and units columns to keep each digit in its correct value."
  },
  remainder_ignored: {
    label: "Remainder overlooked",
    explanation: "When dividing, any leftover amount must be accounted for as a remainder or fraction."
  },
  division_by_wrong_step: {
    label: "Division step miscalculated",
    explanation: "Think: what number multiplied by the divisor gives the dividend?"
  },
  added_numerators_and_denominators: {
    label: "Added denominators together",
    explanation: "When adding fractions with common denominators, add only the numerators: 2/5 + 1/5 = 3/5."
  },
  multiplied_instead_of_divided_fraction: {
    label: "Fraction operation reversed",
    explanation: "Dividing by a fraction means multiplying by its reciprocal (flip the second fraction)."
  },
  decimal_place_shift: {
    label: "Decimal point misaligned",
    explanation: "Align decimal points vertically before adding or subtracting decimals."
  },
  percent_as_decimal_shift: {
    label: "Percentage conversion shifted",
    explanation: "Percent means per hundred: 70% is 70/100 = 0.7, not 0.07 or 7.0."
  },
  ratio_order_swapped: {
    label: "Ratio order reversed",
    explanation: "Keep terms in the order given: ratio of red to blue means red comes first."
  },
  sign_error: {
    label: "Negative sign rule error",
    explanation: "Subtracting a negative number is equivalent to adding: 5 - (-3) = 5 + 3 = 8."
  },
  only_one_side: {
    label: "Applied operation to only one side of equation",
    explanation: "An equation is a balance: whatever you do to the left side, do to the right side."
  },
  combined_unlike_terms: {
    label: "Combined unlike algebraic terms",
    explanation: "You can only combine like terms (e.g., 3x and 2x combine to 5x, but 3x + 2 remains 3x + 2)."
  },
  slope_formula_inverted: {
    label: "Inverted gradient / slope",
    explanation: "Gradient is rise over run: (y2 - y1) / (x2 - x1), vertical change over horizontal change."
  },
  quadratic_sign_error: {
    label: "Signs swapped in factorisation",
    explanation: "Check your factors by expanding back: (x + a)(x + b) must give the middle term and constant."
  },
  pythagoras_added_not_squared: {
    label: "Added legs without squaring",
    explanation: "Pythagoras theorem states a^2 + b^2 = c^2, so square both legs before adding."
  },
  area_perimeter_confusion: {
    label: "Confused area with perimeter",
    explanation: "Area is space inside (length × width), while perimeter is distance around the outside."
  }
};

const mathsLevels = [
  {
    id: 1,
    name: "Numbers to 99 and counting",
    classLabel: "Class 1",
    prerequisites: [],
    teacherActivity: {
      minutes: 15,
      title: "Number bead line-up",
      steps: [
        "Lay number flashcards 1 to 99 on the floor in sequence.",
        "Call out a number ('find forty-seven') and ask students to point.",
        "Ask what comes immediately before and after the target number."
      ]
    },
    selfPractice: "Complete missing number sequences in blocks of ten (e.g. 31, 32, __, 34)."
  },
  {
    id: 2,
    name: "Two-digit addition and subtraction, tables 2/5/10",
    classLabel: "Class 2",
    prerequisites: [1],
    teacherActivity: {
      minutes: 15,
      title: "Tens and units with sticks",
      steps: [
        "Show numbers as bundles of ten sticks and loose single sticks.",
        "To subtract with regrouping, unbundle one ten into ten ones.",
        "Practice skip counting rhythmically by 2, 5, and 10."
      ]
    },
    selfPractice: "Pair practice: one partner creates a two-digit sum with counters, the other writes and solves."
  },
  {
    id: 3,
    name: "Multiplication tables to 10, 3-digit place value",
    classLabel: "Class 3",
    prerequisites: [2],
    teacherActivity: {
      minutes: 15,
      title: "Array grids and place value houses",
      steps: [
        "Draw arrays of dots (e.g., 4 rows of 6) to connect repeated addition to multiplication.",
        "Use three columns (Hundreds, Tens, Ones) with digit cards.",
        "Chant multiplication tables 3 through 9 with clapping rhythms."
      ]
    },
    selfPractice: "Fill in blank cells on a 10 × 10 multiplication grid with a partner."
  },
  {
    id: 4,
    name: "Division, 4-digit numbers",
    classLabel: "Class 4",
    prerequisites: [3, 2],
    teacherActivity: {
      minutes: 15,
      title: "Fair sharing and thousand blocks",
      steps: [
        "Distribute 24 counters equally into 4 cups to model 24 ÷ 4 = 6.",
        "Introduce remainders using 25 counters divided into 4 cups.",
        "Build 4-digit numbers using thousands, hundreds, tens, and units cards."
      ]
    },
    selfPractice: "Solve short division puzzle cards and check answers using multiplication."
  },
  {
    id: 5,
    name: "Fractions and decimals",
    classLabel: "Class 5",
    prerequisites: [4],
    teacherActivity: {
      minutes: 15,
      title: "Paper strip folding",
      steps: [
        "Fold paper strips into halves, fourths, and eighths to show equivalent fractions.",
        "Shade 3 out of 10 parts on a grid to represent both 3/10 and 0.3.",
        "Add simple like fractions together on a number line."
      ]
    },
    selfPractice: "Match fraction cards (like 1/2, 2/4, 0.5) to their visual shaded diagrams."
  },
  {
    id: 6,
    name: "Factors, multiples, ratio, integers",
    classLabel: "Class 6",
    prerequisites: [5],
    teacherActivity: {
      minutes: 15,
      title: "Factor trees and temperature lines",
      steps: [
        "Build factor rainbows for 24 and 36 on the chalkboard.",
        "Draw a vertical thermometer line showing positive and negative integers.",
        "Model simple ratios using red and blue bottle caps."
      ]
    },
    selfPractice: "Work in pairs to list all factors of given numbers and find their HCF."
  },
  {
    id: 7,
    name: "Percentages, simple equations",
    classLabel: "Class 7",
    prerequisites: [6],
    teacherActivity: {
      minutes: 15,
      title: "Hundred square grid and balance scales",
      steps: [
        "Use 10x10 grids to convert fractions to percentages (e.g., 1/4 = 25%).",
        "Draw a balance scale showing 'x + 5 = 12' to illustrate inverse operations.",
        "Have students subtract 5 from both pans to isolate x."
      ]
    },
    selfPractice: "Solve one-step equation cards and substitute answers back to check balance."
  },
  {
    id: 8,
    name: "Algebraic expressions, linear equations, squares and roots",
    classLabel: "Class 8",
    prerequisites: [7, 2],
    teacherActivity: {
      minutes: 15,
      title: "Algebra tiles and square grids",
      steps: [
        "Group like terms using colored algebra tiles (x-tiles vs unit squares).",
        "Solve two-step linear equations: subtract constant, then divide by coefficient.",
        "Illustrate squares and square roots using physical square dot arrays."
      ]
    },
    selfPractice: "Simplify algebraic expressions by combining like terms on practice cards."
  },
  {
    id: 9,
    name: "Linear equations and graphs",
    classLabel: "Class 9",
    prerequisites: [8],
    teacherActivity: {
      minutes: 15,
      title: "Coordinate plane plotting",
      steps: [
        "Draw Cartesian axes on grid board; plot (x, y) coordinates.",
        "Graph lines like y = 2x + 1 by making an input-output table.",
        "Demonstrate gradient / slope as vertical rise over horizontal run."
      ]
    },
    selfPractice: "Plot coordinate pairs on grid paper and determine the slope of the line."
  },
  {
    id: 10,
    name: "Quadratic equations (factorising) and Pythagoras",
    classLabel: "Class 10",
    prerequisites: [9, 3],
    teacherActivity: {
      minutes: 15,
      title: "Factor cross-method and 3-4-5 triangle",
      steps: [
        "Factorise x^2 + 7x + 12 by finding two numbers that multiply to 12 and add to 7.",
        "Verify roots by substituting x = -3 and x = -4.",
        "Construct a 3-4-5 right triangle and verify a^2 + b^2 = c^2."
      ]
    },
    selfPractice: "Factorise quadratic expressions and solve for hypotenuses of right triangles."
  }
];

const mathsQuestions = [
  // Level 1: Numbers to 99 (Class 1)
  makeQuestion({
    id: 'M1Q1', level: 1, prompt: 'Which number is fifty-four?', answer: '54', answerPos: 1,
    wrongsWithTags: { '45': 'digits_reversed', '504': 'expanded_form_written_together', '405': 'digits_reversed' }
  }),
  makeQuestion({
    id: 'M1Q2', level: 1, prompt: 'What number comes right after 69?', answer: '70', answerPos: 2,
    wrongsWithTags: { '68': 'count_offset', '79': 'place_value_shift', '60': 'count_offset' }
  }),
  makeQuestion({
    id: 'M1Q3', level: 1, prompt: 'Which number is eighty-two?', answer: '82', answerPos: 0,
    wrongsWithTags: { '28': 'digits_reversed', '802': 'expanded_form_written_together', '208': 'digits_reversed' }
  }),
  makeQuestion({
    id: 'M1Q4', level: 1, prompt: 'Which number is smaller: 38 or 83?', answer: '38', answerPos: 3,
    wrongsWithTags: { '83': 'digits_reversed', '380': 'place_value_shift', '830': 'place_value_shift' }
  }),
  makeQuestion({
    id: 'M1Q5', level: 1, prompt: 'What is 30 + 7?', answer: '37', answerPos: 1,
    wrongsWithTags: { '73': 'digits_reversed', '307': 'expanded_form_written_together', '27': 'count_offset' }
  }),

  // Level 2: Two-digit addition and subtraction, tables 2/5/10 (Class 2)
  makeQuestion({
    id: 'M2Q1', level: 2, prompt: 'What is 52 - 17?', answer: '35', answerPos: 0,
    wrongsWithTags: { '45': 'borrowing_tens_not_reduced', '39': 'subtracted_smaller_from_larger_digit', '69': 'add_instead_of_subtract' }
  }),
  makeQuestion({
    id: 'M2Q2', level: 2, prompt: 'What is 28 + 15?', answer: '43', answerPos: 2,
    wrongsWithTags: { '33': 'borrowing_tens_not_reduced', '41': 'count_offset', '13': 'add_instead_of_subtract' }
  }),
  makeQuestion({
    id: 'M2Q3', level: 2, prompt: 'What is 5 × 6?', answer: '30', answerPos: 1,
    wrongsWithTags: { '25': 'table_skip_error', '35': 'table_skip_error', '11': 'added_instead_of_multiplied' }
  }),
  makeQuestion({
    id: 'M2Q4', level: 2, prompt: 'What is 63 - 28?', answer: '35', answerPos: 3,
    wrongsWithTags: { '45': 'borrowing_tens_not_reduced', '31': 'subtracted_smaller_from_larger_digit', '91': 'add_instead_of_subtract' }
  }),
  makeQuestion({
    id: 'M2Q5', level: 2, prompt: 'What is 10 × 4?', answer: '40', answerPos: 0,
    wrongsWithTags: { '14': 'added_instead_of_multiplied', '50': 'table_skip_error', '400': 'place_value_shift' }
  }),

  // Level 3: Multiplication tables to 10, 3-digit place value (Class 3)
  makeQuestion({
    id: 'M3Q1', level: 3, prompt: 'What is 7 × 8?', answer: '56', answerPos: 2,
    wrongsWithTags: { '54': 'table_skip_error', '48': 'table_skip_error', '15': 'added_instead_of_multiplied' }
  }),
  makeQuestion({
    id: 'M3Q2', level: 3, prompt: 'In the number 472, what is the value of the digit 7?', answer: '70', answerPos: 1,
    wrongsWithTags: { '7': 'place_value_shift', '700': 'place_value_shift', '47': 'digits_reversed' }
  }),
  makeQuestion({
    id: 'M3Q3', level: 3, prompt: 'What is 9 × 6?', answer: '54', answerPos: 3,
    wrongsWithTags: { '63': 'table_skip_error', '45': 'table_skip_error', '15': 'added_instead_of_multiplied' }
  }),
  makeQuestion({
    id: 'M3Q4', level: 3, prompt: 'What is 6 × 7?', answer: '42', answerPos: 0,
    wrongsWithTags: { '48': 'table_skip_error', '36': 'table_skip_error', '13': 'added_instead_of_multiplied' }
  }),
  makeQuestion({
    id: 'M3Q5', level: 3, prompt: 'What is 300 + 40 + 8?', answer: '348', answerPos: 1,
    wrongsWithTags: { '3048': 'expanded_form_written_together', '384': 'digits_reversed', '438': 'place_value_shift' }
  }),

  // Level 4: Division, 4-digit numbers (Class 4)
  makeQuestion({
    id: 'M4Q1', level: 4, prompt: 'What is 48 ÷ 6?', answer: '8', answerPos: 0,
    wrongsWithTags: { '7': 'division_by_wrong_step', '9': 'division_by_wrong_step', '6': 'division_by_wrong_step' }
  }),
  makeQuestion({
    id: 'M4Q2', level: 4, prompt: 'What is 72 ÷ 8?', answer: '9', answerPos: 2,
    wrongsWithTags: { '8': 'division_by_wrong_step', '7': 'division_by_wrong_step', '64': 'table_skip_error' }
  }),
  makeQuestion({
    id: 'M4Q3', level: 4, prompt: 'In 5,420, what is the value of the digit 5?', answer: '5,000', answerPos: 1,
    wrongsWithTags: { '500': 'place_value_shift', '50': 'place_value_shift', '5': 'place_value_shift' }
  }),
  makeQuestion({
    id: 'M4Q4', level: 4, prompt: 'What is 84 ÷ 4?', answer: '21', answerPos: 3,
    wrongsWithTags: { '22': 'division_by_wrong_step', '20': 'division_by_wrong_step', '18': 'division_by_wrong_step' }
  }),
  makeQuestion({
    id: 'M4Q5', level: 4, prompt: 'What is 27 divided by 4?', answer: '6 R 3', answerPos: 0,
    wrongsWithTags: { '6': 'remainder_ignored', '7': 'division_by_wrong_step', '5 R 2': 'division_by_wrong_step' }
  }),

  // Level 5: Fractions and decimals (Class 5)
  makeQuestion({
    id: 'M5Q1', level: 5, prompt: 'What is 2/5 + 1/5?', answer: '3/5', answerPos: 1,
    wrongsWithTags: { '3/10': 'added_numerators_and_denominators', '2/10': 'added_numerators_and_denominators', '3/25': 'added_numerators_and_denominators' }
  }),
  makeQuestion({
    id: 'M5Q2', level: 5, prompt: 'What is 3/4 as a decimal?', answer: '0.75', answerPos: 2,
    wrongsWithTags: { '0.34': 'percent_as_decimal_shift', '0.7': 'decimal_place_shift', '3.4': 'decimal_place_shift' }
  }),
  makeQuestion({
    id: 'M5Q3', level: 5, prompt: 'What is 0.4 + 0.35?', answer: '0.75', answerPos: 0,
    wrongsWithTags: { '0.39': 'decimal_place_shift', '0.79': 'decimal_place_shift', '7.5': 'decimal_place_shift' }
  }),
  makeQuestion({
    id: 'M5Q4', level: 5, prompt: 'What is 5/6 - 2/6?', answer: '3/6', answerPos: 3,
    wrongsWithTags: { '3/0': 'added_numerators_and_denominators', '3/12': 'added_numerators_and_denominators', '7/6': 'add_instead_of_subtract' }
  }),
  makeQuestion({
    id: 'M5Q5', level: 5, prompt: 'Which fraction is equal to 1/2?', answer: '3/6', answerPos: 1,
    wrongsWithTags: { '2/6': 'place_value_shift', '1/4': 'place_value_shift', '3/5': 'place_value_shift' }
  }),

  // Level 6: Factors, multiples, ratio, integers (Class 6)
  makeQuestion({
    id: 'M6Q1', level: 6, prompt: 'What is the highest common factor (HCF) of 12 and 18?', answer: '6', answerPos: 0,
    wrongsWithTags: { '3': 'division_by_wrong_step', '2': 'division_by_wrong_step', '36': 'table_skip_error' }
  }),
  makeQuestion({
    id: 'M6Q2', level: 6, prompt: 'What is 5 - (-3)?', answer: '8', answerPos: 2,
    wrongsWithTags: { '2': 'sign_error', '-2': 'sign_error', '-8': 'sign_error' }
  }),
  makeQuestion({
    id: 'M6Q3', level: 6, prompt: 'In a class of 12 boys and 8 girls, what is the ratio of boys to girls in simplest form?', answer: '3:2', answerPos: 1,
    wrongsWithTags: { '2:3': 'ratio_order_swapped', '6:4': 'place_value_shift', '3:5': 'ratio_order_swapped' }
  }),
  makeQuestion({
    id: 'M6Q4', level: 6, prompt: 'What is 70% written as a decimal?', answer: '0.7', answerPos: 3,
    wrongsWithTags: { '0.07': 'percent_as_decimal_shift', '7.0': 'percent_as_decimal_shift', '0.007': 'percent_as_decimal_shift' }
  }),
  makeQuestion({
    id: 'M6Q5', level: 6, prompt: 'What is -4 + (-6)?', answer: '-10', answerPos: 0,
    wrongsWithTags: { '-2': 'sign_error', '2': 'sign_error', '10': 'sign_error' }
  }),

  // Level 7: Percentages, simple equations (Class 7)
  makeQuestion({
    id: 'M7Q1', level: 7, prompt: 'What is 20% of 80?', answer: '16', answerPos: 1,
    wrongsWithTags: { '8': 'percent_as_decimal_shift', '24': 'table_skip_error', '40': 'percent_as_decimal_shift' }
  }),
  makeQuestion({
    id: 'M7Q2', level: 7, prompt: 'Solve for x: x + 7 = 19', answer: '12', answerPos: 0,
    wrongsWithTags: { '26': 'add_instead_of_subtract', '13': 'count_offset', '11': 'count_offset' }
  }),
  makeQuestion({
    id: 'M7Q3', level: 7, prompt: 'Solve for y: 3y = 21', answer: '7', answerPos: 2,
    wrongsWithTags: { '18': 'add_instead_of_subtract', '24': 'add_instead_of_subtract', '6': 'division_by_wrong_step' }
  }),
  makeQuestion({
    id: 'M7Q4', level: 7, prompt: 'A price increased from 50 to 60. What is the percentage increase?', answer: '20%', answerPos: 3,
    wrongsWithTags: { '10%': 'percent_as_decimal_shift', '25%': 'percent_as_decimal_shift', '15%': 'percent_as_decimal_shift' }
  }),
  makeQuestion({
    id: 'M7Q5', level: 7, prompt: 'Solve for m: m - 9 = 15', answer: '24', answerPos: 1,
    wrongsWithTags: { '6': 'add_instead_of_subtract', '22': 'count_offset', '26': 'count_offset' }
  }),

  // Level 8: Algebraic expressions, linear equations, squares and roots (Class 8)
  makeQuestion({
    id: 'M8Q1', level: 8, prompt: 'Simplify the expression: 3x + 4 + 2x - 1', answer: '5x + 3', answerPos: 2,
    wrongsWithTags: { '8x': 'combined_unlike_terms', '5x + 5': 'sign_error', '6x + 3': 'table_skip_error' }
  }),
  makeQuestion({
    id: 'M8Q2', level: 8, prompt: 'If x = 4, what is the value of 2x + 3?', answer: '11', answerPos: 0,
    wrongsWithTags: { '9': 'added_instead_of_multiplied', '14': 'table_skip_error', '24': 'expanded_form_written_together' }
  }),
  makeQuestion({
    id: 'M8Q3', level: 8, prompt: 'What is sqrt(49)?', answer: '7', answerPos: 1,
    wrongsWithTags: { '8': 'table_skip_error', '6': 'table_skip_error', '24.5': 'division_by_wrong_step' }
  }),
  makeQuestion({
    id: 'M8Q4', level: 8, prompt: 'Solve for x: 2x + 5 = 17', answer: '6', answerPos: 3,
    wrongsWithTags: { '11': 'only_one_side', '7': 'count_offset', '22': 'add_instead_of_subtract' }
  }),
  makeQuestion({
    id: 'M8Q5', level: 8, prompt: 'What is 3^2 + 4^2?', answer: '25', answerPos: 0,
    wrongsWithTags: { '14': 'added_instead_of_multiplied', '49': 'pythagoras_added_not_squared', '24': 'table_skip_error' }
  }),

  // Level 9: Linear equations and graphs (Class 9)
  makeQuestion({
    id: 'M9Q1', level: 9, prompt: 'Solve for x: 3x - 4 = 14', answer: '6', answerPos: 1,
    wrongsWithTags: { '5': 'count_offset', '10': 'only_one_side', '18': 'only_one_side' }
  }),
  makeQuestion({
    id: 'M9Q2', level: 9, prompt: 'What is the slope (gradient) of the line passing through (2, 2) and (5, 8)?', answer: '2', answerPos: 2,
    wrongsWithTags: { '0.5': 'slope_formula_inverted', '3': 'table_skip_error', '6': 'only_one_side' }
  }),
  makeQuestion({
    id: 'M9Q3', level: 9, prompt: 'Solve for x: 4x + 7 = 2x + 19', answer: '6', answerPos: 0,
    wrongsWithTags: { '13': 'only_one_side', '4': 'count_offset', '7': 'count_offset' }
  }),
  makeQuestion({
    id: 'M9Q4', level: 9, prompt: 'What is the y-intercept of the line y = 3x - 5?', answer: '-5', answerPos: 3,
    wrongsWithTags: { '3': 'slope_formula_inverted', '5': 'sign_error', '0': 'place_value_shift' }
  }),
  makeQuestion({
    id: 'M9Q5', level: 9, prompt: 'If 2x + 3y = 12 and x = 3, what is y?', answer: '2', answerPos: 1,
    wrongsWithTags: { '3': 'count_offset', '6': 'only_one_side', '1': 'count_offset' }
  }),

  // Level 10: Quadratic equations (factorising) and Pythagoras (Class 10)
  makeQuestion({
    id: 'M10Q1', level: 10, prompt: 'Factorise: x^2 + 5x + 6', answer: '(x + 2)(x + 3)', answerPos: 0,
    wrongsWithTags: { '(x - 2)(x - 3)': 'quadratic_sign_error', '(x + 1)(x + 6)': 'quadratic_sign_error', '(x + 5)(x + 1)': 'quadratic_sign_error' }
  }),
  makeQuestion({
    id: 'M10Q2', level: 10, prompt: 'A right-angled triangle has legs of lengths 3 cm and 4 cm. What is the length of the hypotenuse?', answer: '5 cm', answerPos: 2,
    wrongsWithTags: { '7 cm': 'pythagoras_added_not_squared', '6 cm': 'table_skip_error', '25 cm': 'pythagoras_added_not_squared' }
  }),
  makeQuestion({
    id: 'M10Q3', level: 10, prompt: 'Solve for x: x^2 - 9 = 0', answer: 'x = 3 or -3', answerPos: 1,
    wrongsWithTags: { 'x = 3 only': 'quadratic_sign_error', 'x = 9 or -9': 'pythagoras_added_not_squared', 'x = 4.5': 'division_by_wrong_step' }
  }),
  makeQuestion({
    id: 'M10Q4', level: 10, prompt: 'In a right triangle, hypotenuse is 10 cm and one leg is 6 cm. What is the other leg?', answer: '8 cm', answerPos: 3,
    wrongsWithTags: { '4 cm': 'pythagoras_added_not_squared', '16 cm': 'pythagoras_added_not_squared', '64 cm': 'pythagoras_added_not_squared' }
  }),
  makeQuestion({
    id: 'M10Q5', level: 10, prompt: 'What are the roots of the equation (x - 4)(x + 1) = 0?', answer: 'x = 4 or -1', answerPos: 0,
    wrongsWithTags: { 'x = -4 or 1': 'quadratic_sign_error', 'x = 4 or 1': 'quadratic_sign_error', 'x = -4 or -1': 'quadratic_sign_error' }
  })
];

const mathsData = {
  meta: {
    name: "LevelBridge starter data",
    subject: "Maths (Class 1-10 continuous ladder)",
    note: "Starter content written with AI help. A teacher must review it against the school's own textbook before classroom use."
  },
  levels: mathsLevels,
  mistakeTags: mathsMistakeTags,
  questions: mathsQuestions
};

// -------------------------------------------------------------
// 2. ENGLISH DATASET
// -------------------------------------------------------------
const englishMistakeTags = {
  letter_sound_confusion: {
    label: "Letter or sound confused",
    explanation: "Listen carefully to the first sound of the word: 'b' makes /b/ as in ball, while 'd' makes /d/ as in dog."
  },
  noun_verb_confusion: {
    label: "Confused naming word (noun) with action word (verb)",
    explanation: "A noun names a person, place, or thing (e.g. cat, table). A verb describes an action (e.g. run, sleep)."
  },
  tense_form_error: {
    label: "Past or present tense form error",
    explanation: "Check the time clue: 'yesterday' uses past tense (walked/went), whereas 'now' uses present tense (walks/is going)."
  },
  plural_rule_error: {
    label: "Irregular plural rule error",
    explanation: "Some plurals change spelling instead of adding -s (e.g. child becomes children, tooth becomes teeth)."
  },
  pronoun_case_error: {
    label: "Subject vs object pronoun confused",
    explanation: "Use subject pronouns (he, she, they) before verbs and object pronouns (him, her, them) after verbs or prepositions."
  },
  preposition_choice_error: {
    label: "Preposition of time or place incorrect",
    explanation: "We use 'at' for clock times, 'on' for days/dates, and 'in' for months/years."
  },
  synonym_antonym_reversal: {
    label: "Confused opposite (antonym) with similar meaning (synonym)",
    explanation: "A synonym means the same (large = big). An antonym means the opposite (large vs small)."
  },
  subject_verb_agreement: {
    label: "Subject and verb do not agree in number",
    explanation: "A singular subject takes a singular verb (The girl sings), while a plural subject takes a plural verb (The girls sing)."
  },
  article_error: {
    label: "Incorrect article (a / an / the)",
    explanation: "Use 'an' before vowel sounds (an apple, an hour) and 'a' before consonant sounds (a book)."
  },
  passive_voice_confusion: {
    label: "Active and passive voice confused",
    explanation: "In passive voice, the object becomes the subject and the verb includes a form of 'to be' + past participle."
  },
  conjunction_logic_error: {
    label: "Conjunction does not fit the logical relation",
    explanation: "Use 'because' for reasons, 'although' for contrast, and 'so' for results."
  },
  reported_speech_shift: {
    label: "Backshift of tense or pronoun in indirect speech",
    explanation: "In reported speech, present tense usually shifts to past tense (is -> was, said that he was)."
  },
  clause_boundary_error: {
    label: "Independent vs dependent clause boundary confused",
    explanation: "A dependent clause starts with a subordinator (e.g. 'Although it rained') and cannot stand alone as a sentence."
  },
  punctuation_comma_splice: {
    label: "Run-on sentence or comma splice",
    explanation: "Two independent sentences cannot be joined by only a comma without a connecting conjunction."
  },
  literal_interpretation_error: {
    label: "Inferred meaning confused with literal text",
    explanation: "Look beyond the literal words to what the passage implies through tone and context."
  },
  contextual_vocabulary_error: {
    label: "Word meaning misidentified in context",
    explanation: "Re-read the surrounding sentence to see which dictionary definition fits the specific situation."
  }
};

const englishLevels = [
  {
    id: 1,
    name: "Letters and simple words",
    classLabel: "Class 1",
    prerequisites: [],
    teacherActivity: {
      minutes: 15,
      title: "Alphabet sound hunt",
      steps: [
        "Show alphabet flashcards and ask children to speak the letter sound aloud.",
        "Ask children to find objects in the room starting with that sound (e.g. /b/ for bag).",
        "Trace simple three-letter words (CVC words: cat, sun, pen) in sand or air."
      ]
    },
    selfPractice: "Circle pictures that begin with the letter 'S' on practice worksheets."
  },
  {
    id: 2,
    name: "Simple sentences, nouns",
    classLabel: "Class 2",
    prerequisites: [1],
    teacherActivity: {
      minutes: 15,
      title: "Naming-word scavenger jar",
      steps: [
        "Pick slips from a jar containing names of people, places, animals, and things.",
        "Sort the slips into four columns on the board: Person, Place, Animal, Thing.",
        "Form a short 3-word sentence using one of the nouns (e.g., 'The cat sleeps')."
      ]
    },
    selfPractice: "Underline the naming words (nouns) in five short story sentences."
  },
  {
    id: 3,
    name: "Nouns, verbs, simple tenses, short passage",
    classLabel: "Class 3",
    prerequisites: [2],
    teacherActivity: {
      minutes: 15,
      title: "Action verb mime game",
      steps: [
        "One student mimes an everyday action (jumping, writing, eating).",
        "The class identifies the action verb and writes it on mini-slates.",
        "Practice changing the verb from present to past (jump -> jumped)."
      ]
    },
    selfPractice: "Read a 3-sentence animal story with a partner and identify all action words."
  },
  {
    id: 4,
    name: "Adjectives, pronouns, singular/plural, short passage",
    classLabel: "Class 4",
    prerequisites: [3],
    teacherActivity: {
      minutes: 15,
      title: "Describing word mystery bag",
      steps: [
        "Place a mystery object inside a cloth bag; children feel and describe it (soft, round, cold).",
        "Write describing words (adjectives) on the board.",
        "Replace repeated nouns in short sentences with pronouns (he, she, it, they)."
      ]
    },
    selfPractice: "Rewrite short sentences by replacing repeated names with suitable pronouns."
  },
  {
    id: 5,
    name: "Tenses, prepositions, synonyms/antonyms, passage",
    classLabel: "Class 5",
    prerequisites: [4],
    teacherActivity: {
      minutes: 15,
      title: "Time machine grammar chart",
      steps: [
        "Draw a 3-part timeline: Yesterday (Past), Today (Present), Tomorrow (Future).",
        "Move sentence cards along the timeline and change verb tenses accordingly.",
        "Use a small toy box to demonstrate prepositions: in, on, under, between, behind."
      ]
    },
    selfPractice: "Match cards showing opposites (antonyms) and words with similar meanings (synonyms)."
  },
  {
    id: 6,
    name: "Subject-verb agreement, articles, comprehension",
    classLabel: "Class 6",
    prerequisites: [5],
    teacherActivity: {
      minutes: 15,
      title: "Subject-verb balance scales",
      steps: [
        "Pair singular subjects ('The bird') with singular verbs ('flies') on sentence strips.",
        "Pair plural subjects ('The birds') with plural verbs ('fly').",
        "Demonstrate when to use 'a' vs 'an' based on starting vowel sounds."
      ]
    },
    selfPractice: "Select the correct verb to complete sentences with compound or tricky subjects."
  },
  {
    id: 7,
    name: "Active and passive, conjunctions, inference",
    classLabel: "Class 7",
    prerequisites: [6],
    teacherActivity: {
      minutes: 15,
      title: "Connector bridge cards",
      steps: [
        "Join two simple ideas using conjunctions (although, because, therefore, so).",
        "Transform an active sentence ('Rohan kicked the ball') into passive ('The ball was kicked by Rohan').",
        "Discuss what was emphasised in each version (the person vs the action)."
      ]
    },
    selfPractice: "Rewrite active voice sentences into passive voice on practice cards."
  },
  {
    id: 8,
    name: "Reported speech, clauses, vocabulary in context",
    classLabel: "Class 8",
    prerequisites: [7],
    teacherActivity: {
      minutes: 15,
      title: "Telephone dialogue reporting",
      steps: [
        "Student A whispers direct speech: 'I am reading a book.'",
        "Student B reports to the class: 'She said that she was reading a book.'",
        "Highlight changes in tense (am reading -> was reading) and pronouns (I -> she)."
      ]
    },
    selfPractice: "Convert direct speech quotes into indirect reported speech in notebook."
  },
  {
    id: 9,
    name: "Complex sentences, punctuation, inference",
    classLabel: "Class 9",
    prerequisites: [8],
    teacherActivity: {
      minutes: 15,
      title: "Sentence combining workshop",
      steps: [
        "Combine two independent clauses using a semicolon or a subordinating conjunction.",
        "Analyze reading passages to distinguish direct facts from implied inferences.",
        "Fix comma splices by adding suitable coordinating conjunctions."
      ]
    },
    selfPractice: "Read a short paragraph and write down two valid inferences with evidence."
  },
  {
    id: 10,
    name: "Error spotting, tone, cohesion, comprehension",
    classLabel: "Class 10",
    prerequisites: [9],
    teacherActivity: {
      minutes: 15,
      title: "Editor's proofreading desk",
      steps: [
        "Project a paragraph containing intentional grammatical, tense, and article errors.",
        "Have students work in pairs to spot, circle, and correct each error.",
        "Analyze the author's tone (humorous, critical, objective, enthusiastic)."
      ]
    },
    selfPractice: "Edit a 5-sentence essay excerpt and identify the primary tone of the author."
  }
];

const englishQuestions = [
  // Level 1: Letters and simple words (Class 1)
  makeQuestion({
    id: 'E1Q1', level: 1, prompt: "Which word begins with the letter 'B'?", answer: 'Ball', answerPos: 0,
    wrongsWithTags: { 'Dog': 'letter_sound_confusion', 'Cat': 'letter_sound_confusion', 'Sun': 'letter_sound_confusion' }
  }),
  makeQuestion({
    id: 'E1Q2', level: 1, prompt: "Which letter comes right after 'M' in the alphabet?", answer: 'N', answerPos: 2,
    wrongsWithTags: { 'L': 'letter_sound_confusion', 'O': 'letter_sound_confusion', 'P': 'letter_sound_confusion' }
  }),
  makeQuestion({
    id: 'E1Q3', level: 1, prompt: "What is the missing letter in: c _ t (an animal that meows)?", answer: 'a', answerPos: 1,
    wrongsWithTags: { 'o': 'letter_sound_confusion', 'u': 'letter_sound_confusion', 'e': 'letter_sound_confusion' }
  }),
  makeQuestion({
    id: 'E1Q4', level: 1, prompt: "Which word rhymes with 'hat'?", answer: 'Cat', answerPos: 3,
    wrongsWithTags: { 'Dog': 'letter_sound_confusion', 'Cup': 'letter_sound_confusion', 'Pen': 'letter_sound_confusion' }
  }),
  makeQuestion({
    id: 'E1Q5', level: 1, prompt: "Which word is an animal?", answer: 'Lion', answerPos: 1,
    wrongsWithTags: { 'Desk': 'noun_verb_confusion', 'Tree': 'noun_verb_confusion', 'Book': 'noun_verb_confusion' }
  }),

  // Level 2: Simple sentences, nouns (Class 2)
  makeQuestion({
    id: 'E2Q1', level: 2, prompt: "Find the naming word (noun) in this sentence: 'The puppy runs fast.'", answer: 'puppy', answerPos: 0,
    wrongsWithTags: { 'runs': 'noun_verb_confusion', 'fast': 'noun_verb_confusion', 'The': 'article_error' }
  }),
  makeQuestion({
    id: 'E2Q2', level: 2, prompt: "Which word is a person?", answer: 'Teacher', answerPos: 2,
    wrongsWithTags: { 'School': 'noun_verb_confusion', 'Pencil': 'noun_verb_confusion', 'Yellow': 'noun_verb_confusion' }
  }),
  makeQuestion({
    id: 'E2Q3', level: 2, prompt: "Choose the correct sentence:", answer: 'Birds fly in the sky.', answerPos: 1,
    wrongsWithTags: { 'Birds flies in sky.': 'subject_verb_agreement', 'Fly birds in the sky.': 'punctuation_comma_splice', 'Birds flying no sky.': 'tense_form_error' }
  }),
  makeQuestion({
    id: 'E2Q4', level: 2, prompt: "Which word is a thing you can hold?", answer: 'Pencil', answerPos: 3,
    wrongsWithTags: { 'Walk': 'noun_verb_confusion', 'Happy': 'noun_verb_confusion', 'Sing': 'noun_verb_confusion' }
  }),
  makeQuestion({
    id: 'E2Q5', level: 2, prompt: "What is the plural of 'cat'?", answer: 'Cats', answerPos: 0,
    wrongsWithTags: { 'Cates': 'plural_rule_error', 'Caties': 'plural_rule_error', 'Cat': 'plural_rule_error' }
  }),

  // Level 3: Nouns, verbs, simple tenses, short passage (Class 3)
  makeQuestion({
    id: 'E3Q1', level: 3,
    passage: "Mina has a brown rabbit named Hop. Every morning, Mina feeds Hop fresh carrots. Hop jumps around the garden when he is happy.",
    prompt: "What does Hop eat every morning?", answer: 'Fresh carrots', answerPos: 1,
    wrongsWithTags: { 'Green apples': 'literal_interpretation_error', 'Dry seeds': 'literal_interpretation_error', 'Sweet bread': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E3Q2', level: 3, prompt: "Identify the action word (verb): 'The children laughed loudly.'", answer: 'laughed', answerPos: 2,
    wrongsWithTags: { 'children': 'noun_verb_confusion', 'loudly': 'noun_verb_confusion', 'The': 'article_error' }
  }),
  makeQuestion({
    id: 'E3Q3', level: 3, prompt: "Choose the past tense of 'go':", answer: 'went', answerPos: 0,
    wrongsWithTags: { 'goed': 'tense_form_error', 'goes': 'tense_form_error', 'gone': 'tense_form_error' }
  }),
  makeQuestion({
    id: 'E3Q4', level: 3,
    passage: "Sunita planted a sunflower seed in a small clay pot. She watered it every day. After two weeks, a green shoot appeared.",
    prompt: "When did the green shoot appear?", answer: 'After two weeks', answerPos: 3,
    wrongsWithTags: { 'After two days': 'literal_interpretation_error', 'Next morning': 'literal_interpretation_error', 'After one month': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E3Q5', level: 3, prompt: "Which word completes the sentence: 'Yesterday, Ali _ his bicycle.'", answer: 'rode', answerPos: 1,
    wrongsWithTags: { 'rides': 'tense_form_error', 'riding': 'tense_form_error', 'ride': 'tense_form_error' }
  }),

  // Level 4: Adjectives, pronouns, singular/plural, short passage (Class 4)
  makeQuestion({
    id: 'E4Q1', level: 4, prompt: "What is the describing word (adjective) in: 'The tall giraffe ate green leaves.'?", answer: 'tall', answerPos: 0,
    wrongsWithTags: { 'giraffe': 'noun_verb_confusion', 'ate': 'noun_verb_confusion', 'leaves': 'noun_verb_confusion' }
  }),
  makeQuestion({
    id: 'E4Q2', level: 4, prompt: "Replace the underlined word: 'Rohan is hungry. Rohan wants an apple.'", answer: 'He', answerPos: 2,
    wrongsWithTags: { 'Him': 'pronoun_case_error', 'His': 'pronoun_case_error', 'They': 'pronoun_case_error' }
  }),
  makeQuestion({
    id: 'E4Q3', level: 4, prompt: "What is the plural of 'child'?", answer: 'children', answerPos: 1,
    wrongsWithTags: { 'childs': 'plural_rule_error', 'childrens': 'plural_rule_error', 'childes': 'plural_rule_error' }
  }),
  makeQuestion({
    id: 'E4Q4', level: 4,
    passage: "Tariq built a wooden birdhouse with his grandfather. They painted it bright yellow and hung it on the mango tree. Within three days, two sparrows made a nest inside.",
    prompt: "What color was the birdhouse painted?", answer: 'Bright yellow', answerPos: 3,
    wrongsWithTags: { 'Dark brown': 'literal_interpretation_error', 'Light blue': 'literal_interpretation_error', 'Plain green': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E4Q5', level: 4, prompt: "Which pronoun correctly fits: 'My parents are teachers. _ work together.'?", answer: 'They', answerPos: 0,
    wrongsWithTags: { 'Them': 'pronoun_case_error', 'He': 'pronoun_case_error', 'Their': 'pronoun_case_error' }
  }),

  // Level 5: Tenses, prepositions, synonyms/antonyms, passage (Class 5)
  makeQuestion({
    id: 'E5Q1', level: 5, prompt: "Choose the correct preposition: 'The cat jumped _ the table.'", answer: 'onto', answerPos: 1,
    wrongsWithTags: { 'at': 'preposition_choice_error', 'between': 'preposition_choice_error', 'of': 'preposition_choice_error' }
  }),
  makeQuestion({
    id: 'E5Q2', level: 5, prompt: "What is the opposite (antonym) of 'ancient'?", answer: 'Modern', answerPos: 2,
    wrongsWithTags: { 'Old': 'synonym_antonym_reversal', 'Historic': 'synonym_antonym_reversal', 'Huge': 'synonym_antonym_reversal' }
  }),
  makeQuestion({
    id: 'E5Q3', level: 5,
    passage: "The village library opened every Saturday at nine. Children waited outside in the cool morning breeze, eager to return old adventure tales and borrow new mystery books.",
    prompt: "Why were the children eager on Saturday morning?", answer: 'To return and borrow books', answerPos: 0,
    wrongsWithTags: { 'To play in the breeze': 'literal_interpretation_error', 'To buy sweet snacks': 'literal_interpretation_error', 'To attend music class': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E5Q4', level: 5, prompt: "What is a word with the same meaning (synonym) as 'rapid'?", answer: 'Quick', answerPos: 3,
    wrongsWithTags: { 'Slow': 'synonym_antonym_reversal', 'Heavy': 'synonym_antonym_reversal', 'Calm': 'synonym_antonym_reversal' }
  }),
  makeQuestion({
    id: 'E5Q5', level: 5, prompt: "Which sentence is in future tense?", answer: 'We will visit the museum tomorrow.', answerPos: 1,
    wrongsWithTags: { 'We visited the museum yesterday.': 'tense_form_error', 'We visit the museum often.': 'tense_form_error', 'We were visiting the museum.': 'tense_form_error' }
  }),

  // Level 6: Subject-verb agreement, articles, comprehension (Class 6)
  makeQuestion({
    id: 'E6Q1', level: 6, prompt: "Fill in the blank: 'Neither of the boys _ present today.'", answer: 'was', answerPos: 0,
    wrongsWithTags: { 'were': 'subject_verb_agreement', 'are': 'subject_verb_agreement', 'have been': 'subject_verb_agreement' }
  }),
  makeQuestion({
    id: 'E6Q2', level: 6, prompt: "Choose the correct article: 'He is _ honest worker.'", answer: 'an', answerPos: 2,
    wrongsWithTags: { 'a': 'article_error', 'the': 'article_error', 'no article': 'article_error' }
  }),
  makeQuestion({
    id: 'E6Q3', level: 6,
    passage: "Solar panels convert light directly into electrical energy without creating smoke or chemical waste. While installing panels requires initial savings, homes generate clean power for decades.",
    prompt: "What is a major advantage of solar panels mentioned in the text?", answer: 'They produce clean power without smoke', answerPos: 1,
    wrongsWithTags: { 'They cost nothing to install': 'literal_interpretation_error', 'They only work during winter': 'literal_interpretation_error', 'They require daily chemical refills': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E6Q4', level: 6, prompt: "Which sentence has correct subject-verb agreement?", answer: 'The bouquet of roses smells wonderful.', answerPos: 3,
    wrongsWithTags: { 'The bouquet of roses smell wonderful.': 'subject_verb_agreement', 'The roses in bouquet smells bad.': 'subject_verb_agreement', 'Bouquets of roses smells sweet.': 'subject_verb_agreement' }
  }),
  makeQuestion({
    id: 'E6Q5', level: 6, prompt: "Choose the correct article: 'Mount Everest is _ highest peak in the world.'", answer: 'the', answerPos: 0,
    wrongsWithTags: { 'a': 'article_error', 'an': 'article_error', 'no article': 'article_error' }
  }),

  // Level 7: Active and passive, conjunctions, inference (Class 7)
  makeQuestion({
    id: 'E7Q1', level: 7, prompt: "Change to passive voice: 'The chef cooked a delicious dinner.'", answer: 'A delicious dinner was cooked by the chef.', answerPos: 1,
    wrongsWithTags: { 'A delicious dinner is cooked by chef.': 'passive_voice_confusion', 'The chef was cooked by dinner.': 'passive_voice_confusion', 'Dinner cooked the chef deliciously.': 'passive_voice_confusion' }
  }),
  makeQuestion({
    id: 'E7Q2', level: 7, prompt: "Choose the correct conjunction: '_ it rained heavily, the football match continued.'", answer: 'Although', answerPos: 0,
    wrongsWithTags: { 'Because': 'conjunction_logic_error', 'Therefore': 'conjunction_logic_error', 'Since': 'conjunction_logic_error' }
  }),
  makeQuestion({
    id: 'E7Q3', level: 7,
    passage: "Deepak packed two thick sweaters, woolen gloves, and heavy boots into his travel bag. He double-checked his flashlight and sturdy walking cane before heading to the bus stand.",
    prompt: "What can be inferred about Deepak's travel destination?", answer: 'He is traveling to a cold, hilly area', answerPos: 2,
    wrongsWithTags: { 'He is going to a sunny beach resort': 'literal_interpretation_error', 'He is attending an indoor swimming camp': 'literal_interpretation_error', 'He is visiting a desert in midday summer': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E7Q4', level: 7, prompt: "Change to active voice: 'The novel was written by Mary Shelley.'", answer: 'Mary Shelley wrote the novel.', answerPos: 3,
    wrongsWithTags: { 'Mary Shelley was writing novel.': 'passive_voice_confusion', 'The novel wrote Mary Shelley.': 'passive_voice_confusion', 'Mary Shelley has written novel.': 'passive_voice_confusion' }
  }),
  makeQuestion({
    id: 'E7Q5', level: 7, prompt: "Select the sentence with proper conjunction usage:", answer: 'She worked diligently, so she passed the exam.', answerPos: 1,
    wrongsWithTags: { 'She worked diligently, because she passed.': 'conjunction_logic_error', 'Although she worked diligently, she passed.': 'conjunction_logic_error', 'She worked diligently unless she passed.': 'conjunction_logic_error' }
  }),

  // Level 8: Reported speech, clauses, vocabulary in context (Class 8)
  makeQuestion({
    id: 'E8Q1', level: 8, prompt: "Change to reported speech: He said, 'I am learning Spanish.'", answer: 'He said that he was learning Spanish.', answerPos: 0,
    wrongsWithTags: { 'He said that I am learning Spanish.': 'reported_speech_shift', 'He said that he is learning Spanish.': 'reported_speech_shift', 'He said he will learn Spanish.': 'reported_speech_shift' }
  }),
  makeQuestion({
    id: 'E8Q2', level: 8,
    passage: "The scientist scrutinized the mineral sample under an electron microscope, noting tiny microscopic fissures that were invisible to the naked eye.",
    prompt: "In this passage, what does 'scrutinized' mean?", answer: 'Examined very closely and carefully', answerPos: 2,
    wrongsWithTags: { 'Cleaned with chemical solvent': 'contextual_vocabulary_error', 'Ignored after brief glance': 'contextual_vocabulary_error', 'Stored away in wooden crate': 'contextual_vocabulary_error' }
  }),
  makeQuestion({
    id: 'E8Q3', level: 8, prompt: "Identify the dependent clause: 'When the bell rang, the students left the classroom.'", answer: 'When the bell rang', answerPos: 1,
    wrongsWithTags: { 'the students left the classroom': 'clause_boundary_error', 'left the classroom': 'clause_boundary_error', 'the bell rang': 'clause_boundary_error' }
  }),
  makeQuestion({
    id: 'E8Q4', level: 8, prompt: "Change to indirect speech: Sara asked, 'Are you coming to the fair?'", answer: 'Sara asked if I was coming to the fair.', answerPos: 3,
    wrongsWithTags: { 'Sara asked that are you coming.': 'reported_speech_shift', 'Sara asked whether am I coming.': 'reported_speech_shift', 'Sara asked you will come to fair.': 'reported_speech_shift' }
  }),
  makeQuestion({
    id: 'E8Q5', level: 8, prompt: "Which sentence contains a relative clause?", answer: 'The teacher who taught us mathematics has retired.', answerPos: 0,
    wrongsWithTags: { 'The teacher retired yesterday morning.': 'clause_boundary_error', 'Teaching mathematics is rewarding.': 'clause_boundary_error', 'The teacher walked into the classroom.': 'clause_boundary_error' }
  }),

  // Level 9: Complex sentences, punctuation, inference (Class 9)
  makeQuestion({
    id: 'E9Q1', level: 9, prompt: "Which of the following sentences correctly fixes a comma splice?", answer: 'The storm was fierce; however, our shelter stood firm.', answerPos: 1,
    wrongsWithTags: { 'The storm was fierce, our shelter stood firm.': 'punctuation_comma_splice', 'The storm was fierce, however our shelter stood.': 'punctuation_comma_splice', 'The storm was fierce our shelter stood firm.': 'punctuation_comma_splice' }
  }),
  makeQuestion({
    id: 'E9Q2', level: 9,
    passage: "Although the young apprentice made several clumsy missteps on his first day, the master craftsman only smiled quietly and adjusted the boy's grip on the chisel.",
    prompt: "What does the master craftsman's reaction suggest about his character?", answer: 'He is patient and understanding toward beginners', answerPos: 2,
    wrongsWithTags: { 'He is impatient and angry at mistakes': 'literal_interpretation_error', 'He does not care about the craft at all': 'literal_interpretation_error', 'He wants the apprentice to leave immediately': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E9Q3', level: 9, prompt: "Identify the complex sentence:", answer: 'Although she was fatigued, Anita completed the marathon.', answerPos: 0,
    wrongsWithTags: { 'Anita ran fast and won the silver medal.': 'clause_boundary_error', 'Anita was fatigued, but she kept moving.': 'clause_boundary_error', 'Anita finished the long city marathon.': 'clause_boundary_error' }
  }),
  makeQuestion({
    id: 'E9Q4', level: 9, prompt: "Which punctuation mark is used correctly to introduce a formal list?", answer: 'We need three items: compass, ruler, and pencil.', answerPos: 3,
    wrongsWithTags: { 'We need three items; compass, ruler, and pencil.': 'punctuation_comma_splice', 'We need three items- compass, ruler, and pencil.': 'punctuation_comma_splice', 'We need: three items compass, ruler, and pencil.': 'punctuation_comma_splice' }
  }),
  makeQuestion({
    id: 'E9Q5', level: 9, prompt: "In the sentence 'Having finished her project, Maya felt relieved', what is 'Having finished her project'?", answer: 'A participial phrase', answerPos: 1,
    wrongsWithTags: { 'An independent clause': 'clause_boundary_error', 'A prepositional phrase of time': 'clause_boundary_error', 'A relative clause': 'clause_boundary_error' }
  }),

  // Level 10: Error spotting, tone, cohesion, comprehension (Class 10)
  makeQuestion({
    id: 'E10Q1', level: 10,
    passage: "The committee has deliberated for six grueling hours without consensus. While some delegates urge immediate legislation, others caution that hurried policies often produce unintended economic disruption.",
    prompt: "What is the primary tone of the passage?", answer: 'Objective and analytical', answerPos: 0,
    wrongsWithTags: { 'Sarcastic and mocking': 'literal_interpretation_error', 'Furious and agitated': 'literal_interpretation_error', 'Playful and celebratory': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E10Q2', level: 10, prompt: "Spot the grammatical error: 'Each of the participants were given a certificate.'", answer: "'were' should be replaced with 'was'", answerPos: 2,
    wrongsWithTags: { "'Each' should be 'Every'": 'subject_verb_agreement', "'participants' should be 'participant'": 'subject_verb_agreement', "'certificate' should be 'certifications'": 'plural_rule_error' }
  }),
  makeQuestion({
    id: 'E10Q3', level: 10, prompt: "Which sentence displays parallel structure?", answer: 'She likes reading novels, playing badminton, and baking cakes.', answerPos: 1,
    wrongsWithTags: { 'She likes to read novels, playing badminton, and bakes cakes.': 'punctuation_comma_splice', 'She likes novels, to play badminton, and cakes.': 'punctuation_comma_splice', 'She likes reading novels, badminton, and to bake cakes.': 'punctuation_comma_splice' }
  }),
  makeQuestion({
    id: 'E10Q4', level: 10,
    passage: "The ancient aqueduct stands not merely as stone arches across a ravine, but as enduring testimony to municipal foresight, ensuring thirsty communities flourished through recurring droughts.",
    prompt: "What central idea does the author convey about the aqueduct?", answer: 'It represents wise long-term planning that sustained the community', answerPos: 3,
    wrongsWithTags: { 'It was an unnecessary decorative luxury': 'literal_interpretation_error', 'It failed to solve historical water shortages': 'literal_interpretation_error', 'It caused conflicts between neighbouring towns': 'literal_interpretation_error' }
  }),
  makeQuestion({
    id: 'E10Q5', level: 10, prompt: "Choose the cohesive transitional phrase that expresses concession:", answer: 'Be that as it may', answerPos: 0,
    wrongsWithTags: { 'In addition to this': 'conjunction_logic_error', 'As a direct result': 'conjunction_logic_error', 'For this specific reason': 'conjunction_logic_error' }
  })
];

const englishData = {
  meta: {
    name: "LevelBridge starter data",
    subject: "English (Class 1-10 continuous ladder)",
    note: "Starter content written with AI help. A teacher must review it against the school's own textbook before classroom use."
  },
  levels: englishLevels,
  mistakeTags: englishMistakeTags,
  questions: englishQuestions
};

// -------------------------------------------------------------
// 3. SCIENCE DATASET
// -------------------------------------------------------------
const scienceMistakeTags = {
  living_characteristic_error: {
    label: "Confused living vs non-living characteristics",
    explanation: "Living things grow, breathe, need food/water, and reproduce. Non-living objects do not."
  },
  body_part_function_error: {
    label: "Body organ function misidentified",
    explanation: "Different organs perform specific tasks: eyes see, lungs breathe, heart pumps blood, stomach digests."
  },
  habitat_adaptation_confusion: {
    label: "Animal habitat or physical adaptation confused",
    explanation: "Animals have physical traits suited to their habitats (e.g. fins and gills for water, thick fur for polar cold)."
  },
  herbivore_carnivore_omnivore: {
    label: "Feeding classification confused",
    explanation: "Herbivores eat only plants, carnivores eat only other animals, and omnivores eat both plants and animals."
  },
  plant_part_function_confusion: {
    label: "Plant organ function confused",
    explanation: "Roots absorb water/nutrients and anchor; stems transport; leaves perform photosynthesis; flowers produce seeds."
  },
  food_nutrient_group_confusion: {
    label: "Nutrient group or function confused",
    explanation: "Carbohydrates & fats provide energy; proteins build and repair tissues; vitamins & minerals protect against disease."
  },
  states_of_matter_confusion: {
    label: "Physical state of matter or phase change confused",
    explanation: "Solids have definite shape and volume; liquids flow with definite volume; gases expand to fill any container."
  },
  organ_system_function_error: {
    label: "Organ system responsibility confused",
    explanation: "Circulatory transports blood, respiratory exchanges gases, digestive breaks down food, nervous controls responses."
  },
  simple_machine_confusion: {
    label: "Type of simple machine misidentified",
    explanation: "Six simple machines: lever, pulley, wheel & axle, inclined plane, wedge, and screw."
  },
  mixture_separation_error: {
    label: "Separation technique does not match properties",
    explanation: "Filtration separates insoluble solids from liquids; evaporation recovers dissolved solutes; distillation separates based on boiling points."
  },
  acids_bases_indicators: {
    label: "Acidic vs basic property or indicator color confused",
    explanation: "Acids turn blue litmus red and taste sour; bases turn red litmus blue, feel soapy, and taste bitter."
  },
  heat_transfer_mode_confusion: {
    label: "Conduction, convection, or radiation confused",
    explanation: "Conduction transfers heat through direct contact in solids; convection through fluids; radiation through electromagnetic waves."
  },
  force_motion_law_error: {
    label: "Force, friction, or Newton's law misinterpreted",
    explanation: "Friction opposes relative motion between surfaces; balanced forces result in zero net acceleration."
  },
  cell_organelle_confusion: {
    label: "Cell organelle function confused",
    explanation: "Mitochondria release energy (ATP); chloroplasts photosynthesize in plants; nucleus stores genetic DNA."
  },
  atomic_molecular_confusion: {
    label: "Atoms, molecules, or subatomic particles confused",
    explanation: "Protons and neutrons reside in the nucleus, surrounded by electrons in shells. An element contains identical atoms."
  },
  chemical_vs_physical_change: {
    label: "Physical change confused with chemical reaction",
    explanation: "Physical changes alter state or appearance without creating new substances; chemical reactions form new chemical bonds."
  },
  circuit_electricity_error: {
    label: "Open vs closed circuit or Ohm's law relation confused",
    explanation: "Current flows only in a closed complete circuit; electric current is the flow of electric charge (electrons)."
  },
  respiration_photosynthesis_reversal: {
    label: "Photosynthesis confused with cellular respiration",
    explanation: "Photosynthesis consumes CO2 and water to produce glucose and O2; respiration consumes glucose and O2 to produce energy and CO2."
  }
};

const scienceLevels = [
  {
    id: 1,
    name: "Living and non-living, body parts",
    classLabel: "Class 1",
    prerequisites: [],
    teacherActivity: {
      minutes: 15,
      title: "Nature walk and senses check",
      steps: [
        "Take students into the schoolyard to observe living plants/insects and non-living stones/benches.",
        "Categorize items into two columns on a slate: 'Needs food & grows' vs 'Does not grow'.",
        "Point to eyes, ears, nose, tongue, skin to review the five sense organs."
      ]
    },
    selfPractice: "Draw two living things and two non-living things in drawing notebook."
  },
  {
    id: 2,
    name: "Animals, habitats, food, water, air",
    classLabel: "Class 2",
    prerequisites: [1],
    teacherActivity: {
      minutes: 15,
      title: "Animal home and diet sorting",
      steps: [
        "Sort animal picture cards into habitats: Land, Water, Sky/Trees.",
        "Sort cards by diet: Plant-eaters (herbivores) vs Flesh-eaters (carnivores).",
        "Demonstrate that air is all around by trapping it in an inflated balloon."
      ]
    },
    selfPractice: "Match animals to their homes (e.g. bird -> nest, dog -> kennel, fish -> pond)."
  },
  {
    id: 3,
    name: "Plant parts, food groups, soil, light",
    classLabel: "Class 3",
    prerequisites: [2],
    teacherActivity: {
      minutes: 15,
      title: "Uprooted weed inspection and plate balancing",
      steps: [
        "Examine a real potted plant: identify taproot, fibrous roots, stem, leaves, and flower buds.",
        "Sort meal items (rice, dal, spinach, milk) into energy-giving, body-building, and protective food groups.",
        "Show how light travels in a straight line using cardboard holes and a flashlight."
      ]
    },
    selfPractice: "Label parts of a plant diagram (Root, Stem, Leaf, Flower) on a worksheet."
  },
  {
    id: 4,
    name: "Body systems intro, adaptation, states of matter",
    classLabel: "Class 4",
    prerequisites: [3],
    teacherActivity: {
      minutes: 15,
      title: "Three states with ice and water",
      steps: [
        "Show ice cube melting into liquid water, and boil a drop to show water vapor (solid, liquid, gas).",
        "Discuss animal adaptations: why camels have broad padded feet and polar bears have blubber.",
        "Trace breathing cycle: nose -> windpipe -> lungs expanding."
      ]
    },
    selfPractice: "Classify listed materials (wood, oil, steam, pebble, juice) into Solid, Liquid, or Gas."
  },
  {
    id: 5,
    name: "Digestion, materials, simple machines",
    classLabel: "Class 5",
    prerequisites: [4],
    teacherActivity: {
      minutes: 15,
      title: "Ruler lever and digestive pathway",
      steps: [
        "Use a wooden ruler over a pencil fulcrum to lift a book, modeling a simple lever.",
        "Trace the food path from mouth -> esophagus -> stomach -> small intestine -> large intestine.",
        "Compare properties of materials (conductors vs insulators, transparent vs opaque)."
      ]
    },
    selfPractice: "Identify the simple machine (lever, inclined plane, pulley) in everyday classroom tools."
  },
  {
    id: 6,
    name: "Separation of mixtures, motion, plants",
    classLabel: "Class 6",
    prerequisites: [5],
    teacherActivity: {
      minutes: 15,
      title: "Filter paper and pendulum swing",
      steps: [
        "Separate sand and water using a paper funnel and filter paper.",
        "Demonstrate periodic motion using a weighted string pendulum.",
        "Examine leaf venation (parallel in grass vs reticulate in peepal) and relate to root types."
      ]
    },
    selfPractice: "List appropriate separation methods for salt water, rice with stones, and tea leaves."
  },
  {
    id: 7,
    name: "Acids and bases, heat, nutrition in plants",
    classLabel: "Class 7",
    prerequisites: [6],
    teacherActivity: {
      minutes: 15,
      title: "Turmeric indicator test",
      steps: [
        "Dip turmeric paper into lemon juice (acid, stays yellow) and soap solution (base, turns deep red).",
        "Explain conduction along a metal spoon vs convection in heated water.",
        "Discuss photosynthesis formula: sunlight + chlorophyll + carbon dioxide + water -> glucose + oxygen."
      ]
    },
    selfPractice: "Test home substances (vinegar, baking soda, lime juice) with turmeric indicator paper."
  },
  {
    id: 8,
    name: "Force, pressure, cells, chemical changes",
    classLabel: "Class 8",
    prerequisites: [7],
    teacherActivity: {
      minutes: 15,
      title: "Onion peel cell and balloon pressure",
      steps: [
        "Observe onion epidermis under microscope to see cell wall, nucleus, and cytoplasm.",
        "Press a sharp pin vs a blunt wooden block against clay to show Pressure = Force / Area.",
        "Mix vinegar and baking soda to observe effervescence of CO2 gas as a chemical change."
      ]
    },
    selfPractice: "Differentiate plant cells from animal cells in a comparative two-column table."
  },
  {
    id: 9,
    name: "Atoms and molecules, motion, tissues",
    classLabel: "Class 9",
    prerequisites: [8],
    teacherActivity: {
      minutes: 15,
      title: "Bohr atom model and ticker tape motion",
      steps: [
        "Build atomic models of carbon and oxygen with clay balls (protons, neutrons, electrons).",
        "Calculate speed and acceleration from distance-time tables.",
        "Examine permanent slides of plant tissues (xylem, phloem) and animal tissues (epithelial, muscle)."
      ]
    },
    selfPractice: "Calculate molecular mass of water (H2O) and carbon dioxide (CO2) from atomic masses."
  },
  {
    id: 10,
    name: "Chemical reactions, electricity, life processes",
    classLabel: "Class 10",
    prerequisites: [9],
    teacherActivity: {
      minutes: 15,
      title: "Simple circuit and displacement reaction",
      steps: [
        "Dip an iron nail into blue copper sulfate solution to witness displacement and color change to green.",
        "Build a series circuit with bulb, key, and dry cell; measure voltage with multimeter.",
        "Trace human nephron structure and function in kidney filtration."
      ]
    },
    selfPractice: "Balance chemical equations and solve Ohm's law calculations (V = IR)."
  }
];

const scienceQuestions = [
  // Level 1: Living and non-living, body parts (Class 1)
  makeQuestion({
    id: 'S1Q1', level: 1, prompt: "Which of these is a living thing?", answer: 'Sparrow', answerPos: 0,
    wrongsWithTags: { 'Wooden chair': 'living_characteristic_error', 'Plastic bottle': 'living_characteristic_error', 'Stone': 'living_characteristic_error' }
  }),
  makeQuestion({
    id: 'S1Q2', level: 1, prompt: "Which body organ helps us to hear sounds?", answer: 'Ears', answerPos: 2,
    wrongsWithTags: { 'Eyes': 'body_part_function_error', 'Nose': 'body_part_function_error', 'Tongue': 'body_part_function_error' }
  }),
  makeQuestion({
    id: 'S1Q3', level: 1, prompt: "What do living plants need to grow?", answer: 'Water and sunlight', answerPos: 1,
    wrongsWithTags: { 'Cold ice cream': 'living_characteristic_error', 'Plastic bags': 'living_characteristic_error', 'Dark closed boxes': 'living_characteristic_error' }
  }),
  makeQuestion({
    id: 'S1Q4', level: 1, prompt: "Which sense organ do we use to taste sweet mangoes?", answer: 'Tongue', answerPos: 3,
    wrongsWithTags: { 'Skin': 'body_part_function_error', 'Nose': 'body_part_function_error', 'Ears': 'body_part_function_error' }
  }),
  makeQuestion({
    id: 'S1Q5', level: 1, prompt: "Which object does NOT breathe or grow?", answer: 'Bicycle', answerPos: 0,
    wrongsWithTags: { 'Puppy': 'living_characteristic_error', 'Rose bush': 'living_characteristic_error', 'Goldfish': 'living_characteristic_error' }
  }),

  // Level 2: Animals, habitats, food, water, air (Class 2)
  makeQuestion({
    id: 'S2Q1', level: 2, prompt: "Which of these animals lives entirely in water?", answer: 'Fish', answerPos: 1,
    wrongsWithTags: { 'Cow': 'habitat_adaptation_confusion', 'Monkey': 'habitat_adaptation_confusion', 'Elephant': 'habitat_adaptation_confusion' }
  }),
  makeQuestion({
    id: 'S2Q2', level: 2, prompt: "Which animal eats only plants (herbivore)?", answer: 'Deer', answerPos: 0,
    wrongsWithTags: { 'Lion': 'herbivore_carnivore_omnivore', 'Tiger': 'herbivore_carnivore_omnivore', 'Leopard': 'herbivore_carnivore_omnivore' }
  }),
  makeQuestion({
    id: 'S2Q3', level: 2, prompt: "What happens when you blow into a balloon?", answer: 'Air fills inside the balloon', answerPos: 2,
    wrongsWithTags: { 'Water fills inside': 'states_of_matter_confusion', 'Heavy stones collect inside': 'living_characteristic_error', 'The balloon shrinks': 'force_motion_law_error' }
  }),
  makeQuestion({
    id: 'S2Q4', level: 2, prompt: "Where do wild birds build their nests to lay eggs?", answer: 'In trees', answerPos: 3,
    wrongsWithTags: { 'Deep under ocean water': 'habitat_adaptation_confusion', 'Inside heavy clouds': 'habitat_adaptation_confusion', 'Inside fire pits': 'habitat_adaptation_confusion' }
  }),
  makeQuestion({
    id: 'S2Q5', level: 2, prompt: "Which of these is a carnivore (meat-eater)?", answer: 'Tiger', answerPos: 1,
    wrongsWithTags: { 'Rabbit': 'herbivore_carnivore_omnivore', 'Sheep': 'herbivore_carnivore_omnivore', 'Goat': 'herbivore_carnivore_omnivore' }
  }),

  // Level 3: Plant parts, food groups, soil, light (Class 3)
  makeQuestion({
    id: 'S3Q1', level: 3, prompt: "Which plant part absorbs water and mineral nutrients from the soil?", answer: 'Roots', answerPos: 0,
    wrongsWithTags: { 'Flowers': 'plant_part_function_confusion', 'Leaves': 'plant_part_function_confusion', 'Seeds': 'plant_part_function_confusion' }
  }),
  makeQuestion({
    id: 'S3Q2', level: 3, prompt: "Which food nutrient helps build and repair muscles in our body?", answer: 'Protein', answerPos: 2,
    wrongsWithTags: { 'Sugar': 'food_nutrient_group_confusion', 'Fats only': 'food_nutrient_group_confusion', 'Water only': 'food_nutrient_group_confusion' }
  }),
  makeQuestion({
    id: 'S3Q3', level: 3, prompt: "In which part of a green plant does food making (photosynthesis) take place?", answer: 'Leaves', answerPos: 1,
    wrongsWithTags: { 'Roots': 'plant_part_function_confusion', 'Bark': 'plant_part_function_confusion', 'Seeds': 'plant_part_function_confusion' }
  }),
  makeQuestion({
    id: 'S3Q4', level: 3, prompt: "How does light travel from a torch or the sun?", answer: 'In straight lines', answerPos: 3,
    wrongsWithTags: { 'In wavy circles': 'force_motion_law_error', 'In zig-zag steps': 'force_motion_law_error', 'It stands still': 'force_motion_law_error' }
  }),
  makeQuestion({
    id: 'S3Q5', level: 3, prompt: "Which food group gives quick energy to run and play?", answer: 'Carbohydrates', answerPos: 0,
    wrongsWithTags: { 'Fibers only': 'food_nutrient_group_confusion', 'Minerals only': 'food_nutrient_group_confusion', 'Water only': 'food_nutrient_group_confusion' }
  }),

  // Level 4: Body systems intro, adaptation, states of matter (Class 4)
  makeQuestion({
    id: 'S4Q1', level: 4, prompt: "Which state of matter has a fixed volume but takes the shape of its container?", answer: 'Liquid', answerPos: 1,
    wrongsWithTags: { 'Solid': 'states_of_matter_confusion', 'Gas': 'states_of_matter_confusion', 'Plasma only': 'states_of_matter_confusion' }
  }),
  makeQuestion({
    id: 'S4Q2', level: 4, prompt: "Why do camels have broad, padded feet?", answer: 'To walk easily on loose desert sand', answerPos: 0,
    wrongsWithTags: { 'To swim in deep river water': 'habitat_adaptation_confusion', 'To climb tall mountain rocks': 'habitat_adaptation_confusion', 'To run faster on ice sheets': 'habitat_adaptation_confusion' }
  }),
  makeQuestion({
    id: 'S4Q3', level: 4, prompt: "What is the primary organ of the human respiratory system where oxygen enters blood?", answer: 'Lungs', answerPos: 2,
    wrongsWithTags: { 'Stomach': 'organ_system_function_error', 'Kidneys': 'organ_system_function_error', 'Liver': 'organ_system_function_error' }
  }),
  makeQuestion({
    id: 'S4Q4', level: 4, prompt: "What process turns liquid water into water vapor gas when heated?", answer: 'Evaporation', answerPos: 3,
    wrongsWithTags: { 'Freezing': 'states_of_matter_confusion', 'Condensation': 'states_of_matter_confusion', 'Precipitation': 'states_of_matter_confusion' }
  }),
  makeQuestion({
    id: 'S4Q5', level: 4, prompt: "Which organ pumps blood throughout the human body?", answer: 'Heart', answerPos: 0,
    wrongsWithTags: { 'Stomach': 'organ_system_function_error', 'Lungs': 'organ_system_function_error', 'Brain': 'organ_system_function_error' }
  }),

  // Level 5: Digestion, materials, simple machines (Class 5)
  makeQuestion({
    id: 'S5Q1', level: 5, prompt: "Where is most of the digested food absorbed into the bloodstream?", answer: 'Small intestine', answerPos: 1,
    wrongsWithTags: { 'Stomach': 'organ_system_function_error', 'Esophagus': 'organ_system_function_error', 'Large intestine': 'organ_system_function_error' }
  }),
  makeQuestion({
    id: 'S5Q2', level: 5, prompt: "A ramp used to roll heavy wheelbarrows into a truck is an example of which simple machine?", answer: 'Inclined plane', answerPos: 2,
    wrongsWithTags: { 'Pulley': 'simple_machine_confusion', 'Lever': 'simple_machine_confusion', 'Wedge': 'simple_machine_confusion' }
  }),
  makeQuestion({
    id: 'S5Q3', level: 5, prompt: "Which material allows electricity to pass through easily (good conductor)?", answer: 'Copper wire', answerPos: 0,
    wrongsWithTags: { 'Dry wood': 'circuit_electricity_error', 'Rubber band': 'circuit_electricity_error', 'Plastic strip': 'circuit_electricity_error' }
  }),
  makeQuestion({
    id: 'S5Q4', level: 5, prompt: "A seesaw in a playground is an example of which simple machine?", answer: 'Lever', answerPos: 3,
    wrongsWithTags: { 'Screw': 'simple_machine_confusion', 'Wedge': 'simple_machine_confusion', 'Pulley': 'simple_machine_confusion' }
  }),
  makeQuestion({
    id: 'S5Q5', level: 5, prompt: "Which organ stores and churns food with acidic digestive juices?", answer: 'Stomach', answerPos: 1,
    wrongsWithTags: { 'Lungs': 'organ_system_function_error', 'Kidneys': 'organ_system_function_error', 'Windpipe': 'organ_system_function_error' }
  }),

  // Level 6: Separation of mixtures, motion, plants (Class 6)
  makeQuestion({
    id: 'S6Q1', level: 6, prompt: "Which separation technique is best for separating fine sand from water?", answer: 'Filtration', answerPos: 0,
    wrongsWithTags: { 'Evaporation': 'mixture_separation_error', 'Magnetic separation': 'mixture_separation_error', 'Churning': 'mixture_separation_error' }
  }),
  makeQuestion({
    id: 'S6Q2', level: 6, prompt: "The motion of a child on a playground swing back and forth is an example of:", answer: 'Periodic motion', answerPos: 2,
    wrongsWithTags: { 'Circular motion only': 'force_motion_law_error', 'Rectilinear motion in straight line': 'force_motion_law_error', 'Random motion': 'force_motion_law_error' }
  }),
  makeQuestion({
    id: 'S6Q3', level: 6, prompt: "Plants with parallel leaf venation (like grasses) generally possess which type of root system?", answer: 'Fibrous roots', answerPos: 1,
    wrongsWithTags: { 'Taproot system': 'plant_part_function_confusion', 'Aerial prop roots': 'plant_part_function_confusion', 'Stilt roots': 'plant_part_function_confusion' }
  }),
  makeQuestion({
    id: 'S6Q4', level: 6, prompt: "How can salt be recovered from clear salt-water solution?", answer: 'By evaporating the water', answerPos: 3,
    wrongsWithTags: { 'By using a hand sieve': 'mixture_separation_error', 'By paper filtration': 'mixture_separation_error', 'By picking with tweezers': 'mixture_separation_error' }
  }),
  makeQuestion({
    id: 'S6Q5', level: 6, prompt: "Which of the following is a non-contact force?", answer: 'Magnetic force', answerPos: 0,
    wrongsWithTags: { 'Frictional force': 'force_motion_law_error', 'Muscular force': 'force_motion_law_error', 'Mechanical push': 'force_motion_law_error' }
  }),

  // Level 7: Acids and bases, heat, nutrition in plants (Class 7)
  makeQuestion({
    id: 'S7Q1', level: 7, prompt: "What color does blue litmus paper turn when dipped into lemon juice (an acid)?", answer: 'Red', answerPos: 1,
    wrongsWithTags: { 'Blue': 'acids_bases_indicators', 'Green': 'acids_bases_indicators', 'Colorless': 'acids_bases_indicators' }
  }),
  makeQuestion({
    id: 'S7Q2', level: 7, prompt: "How does heat transfer through a solid steel rod when one end is heated in a flame?", answer: 'Conduction', answerPos: 0,
    wrongsWithTags: { 'Convection': 'heat_transfer_mode_confusion', 'Radiation': 'heat_transfer_mode_confusion', 'Sublimation': 'heat_transfer_mode_confusion' }
  }),
  makeQuestion({
    id: 'S7Q3', level: 7, prompt: "Which gas is released by green plants during the process of photosynthesis?", answer: 'Oxygen', answerPos: 2,
    wrongsWithTags: { 'Carbon dioxide': 'respiration_photosynthesis_reversal', 'Nitrogen': 'respiration_photosynthesis_reversal', 'Methane': 'respiration_photosynthesis_reversal' }
  }),
  makeQuestion({
    id: 'S7Q4', level: 7, prompt: "What color does turmeric paper turn when exposed to a basic substance like soap solution?", answer: 'Reddish-brown', answerPos: 3,
    wrongsWithTags: { 'Bright yellow': 'acids_bases_indicators', 'Deep blue': 'acids_bases_indicators', 'Colorless white': 'acids_bases_indicators' }
  }),
  makeQuestion({
    id: 'S7Q5', level: 7, prompt: "How does heat from the sun travel across the vacuum of outer space to reach the Earth?", answer: 'Radiation', answerPos: 1,
    wrongsWithTags: { 'Conduction': 'heat_transfer_mode_confusion', 'Convection': 'heat_transfer_mode_confusion', 'Evaporation': 'heat_transfer_mode_confusion' }
  }),

  // Level 8: Force, pressure, cells, chemical changes (Class 8)
  makeQuestion({
    id: 'S8Q1', level: 8, prompt: "Which cell organelle is known as the 'powerhouse of the cell' because it produces cellular energy?", answer: 'Mitochondrion', answerPos: 0,
    wrongsWithTags: { 'Ribosome': 'cell_organelle_confusion', 'Vacuole': 'cell_organelle_confusion', 'Endoplasmic reticulum': 'cell_organelle_confusion' }
  }),
  makeQuestion({
    id: 'S8Q2', level: 8, prompt: "What is the relationship between Pressure, Force, and Area?", answer: 'Pressure = Force / Area', answerPos: 1,
    wrongsWithTags: { 'Pressure = Force × Area': 'force_motion_law_error', 'Pressure = Area / Force': 'force_motion_law_error', 'Pressure = Force + Area': 'force_motion_law_error' }
  }),
  makeQuestion({
    id: 'S8Q3', level: 8, prompt: "Which of the following represents a chemical change (forms a new substance)?", answer: 'Rusting of iron in humid air', answerPos: 2,
    wrongsWithTags: { 'Melting of ice into water': 'chemical_vs_physical_change', 'Tearing paper into small strips': 'chemical_vs_physical_change', 'Boiling water into steam': 'chemical_vs_physical_change' }
  }),
  makeQuestion({
    id: 'S8Q4', level: 8, prompt: "Which cellular feature is present in plant cells but absent in animal cells?", answer: 'Cell wall and chloroplasts', answerPos: 3,
    wrongsWithTags: { 'Mitochondria': 'cell_organelle_confusion', 'Cytoplasm': 'cell_organelle_confusion', 'Cell membrane': 'cell_organelle_confusion' }
  }),
  makeQuestion({
    id: 'S8Q5', level: 8, prompt: "What force always acts opposite to the direction of motion between two sliding surfaces?", answer: 'Frictional force', answerPos: 0,
    wrongsWithTags: { 'Gravitational force': 'force_motion_law_error', 'Electrostatic force': 'force_motion_law_error', 'Magnetic force': 'force_motion_law_error' }
  }),

  // Level 9: Atoms and molecules, motion, tissues (Class 9)
  makeQuestion({
    id: 'S9Q1', level: 9, prompt: "Which subatomic particle carries a negative electric charge?", answer: 'Electron', answerPos: 1,
    wrongsWithTags: { 'Proton': 'atomic_molecular_confusion', 'Neutron': 'atomic_molecular_confusion', 'Nucleus': 'atomic_molecular_confusion' }
  }),
  makeQuestion({
    id: 'S9Q2', level: 9, prompt: "Which plant vascular tissue is responsible for transporting water and dissolved minerals upward from roots?", answer: 'Xylem', answerPos: 0,
    wrongsWithTags: { 'Phloem': 'plant_part_function_confusion', 'Parenchyma': 'plant_part_function_confusion', 'Collenchyma': 'plant_part_function_confusion' }
  }),
  makeQuestion({
    id: 'S9Q3', level: 9, prompt: "According to Newton's Second Law of Motion, what is the formula for force?", answer: 'Force = mass × acceleration', answerPos: 2,
    wrongsWithTags: { 'Force = mass / acceleration': 'force_motion_law_error', 'Force = velocity / time': 'force_motion_law_error', 'Force = mass × velocity': 'force_motion_law_error' }
  }),
  makeQuestion({
    id: 'S9Q4', level: 9, prompt: "What is the molecular mass of water (H2O), given atomic mass H = 1 u and O = 16 u?", answer: '18 u', answerPos: 3,
    wrongsWithTags: { '17 u': 'atomic_molecular_confusion', '33 u': 'atomic_molecular_confusion', '16 u': 'atomic_molecular_confusion' }
  }),
  makeQuestion({
    id: 'S9Q5', level: 9, prompt: "Which animal tissue contracts to create movement in limbs?", answer: 'Muscular tissue', answerPos: 1,
    wrongsWithTags: { 'Epithelial tissue': 'organ_system_function_error', 'Connective tissue': 'organ_system_function_error', 'Nervous tissue': 'organ_system_function_error' }
  }),

  // Level 10: Chemical reactions, electricity, life processes (Class 10)
  makeQuestion({
    id: 'S10Q1', level: 10, prompt: "What happens when an iron nail is kept in blue copper sulfate solution?", answer: 'Iron displaces copper, turning solution pale green', answerPos: 0,
    wrongsWithTags: { 'The solution turns bright yellow': 'chemical_vs_physical_change', 'No chemical reaction occurs': 'chemical_vs_physical_change', 'Copper dissolves iron completely': 'chemical_vs_physical_change' }
  }),
  makeQuestion({
    id: 'S10Q2', level: 10, prompt: "According to Ohm's Law (V = IR), if voltage is 12 V and resistance is 4 ohms, what is current?", answer: '3 A', answerPos: 2,
    wrongsWithTags: { '48 A': 'circuit_electricity_error', '8 A': 'circuit_electricity_error', '16 A': 'circuit_electricity_error' }
  }),
  makeQuestion({
    id: 'S10Q3', level: 10, prompt: "What is the functional excretory filtration unit inside the human kidney?", answer: 'Nephron', answerPos: 1,
    wrongsWithTags: { 'Neuron': 'organ_system_function_error', 'Alveolus': 'organ_system_function_error', 'Villus': 'organ_system_function_error' }
  }),
  makeQuestion({
    id: 'S10Q4', level: 10, prompt: "What type of chemical reaction is: 2H2 + O2 -> 2H2O?", answer: 'Combination reaction', answerPos: 3,
    wrongsWithTags: { 'Decomposition reaction': 'chemical_vs_physical_change', 'Displacement reaction': 'chemical_vs_physical_change', 'Double displacement reaction': 'chemical_vs_physical_change' }
  }),
  makeQuestion({
    id: 'S10Q5', level: 10, prompt: "Which tiny air sacs in human lungs provide extensive surface area for oxygen-carbon dioxide gas exchange?", answer: 'Alveoli', answerPos: 0,
    wrongsWithTags: { 'Nephrons': 'organ_system_function_error', 'Bronchioles only': 'organ_system_function_error', 'Trachea': 'organ_system_function_error' }
  })
];

const scienceData = {
  meta: {
    name: "LevelBridge starter data",
    subject: "Science (Class 1-10 continuous ladder)",
    note: "Starter content written with AI help. A teacher must review it against the school's own textbook before classroom use."
  },
  levels: scienceLevels,
  mistakeTags: scienceMistakeTags,
  questions: scienceQuestions
};

// Write files
writeFileSync(join(root, 'src/data/maths.json'), JSON.stringify(mathsData, null, 2));
writeFileSync(join(root, 'src/data/english.json'), JSON.stringify(englishData, null, 2));
writeFileSync(join(root, 'src/data/science.json'), JSON.stringify(scienceData, null, 2));

console.log('Successfully generated:');
console.log(' - src/data/maths.json (10 levels, 50 questions)');
console.log(' - src/data/english.json (10 levels, 50 questions)');
console.log(' - src/data/science.json (10 levels, 50 questions)');
