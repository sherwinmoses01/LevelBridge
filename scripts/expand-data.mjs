import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const existing = JSON.parse(readFileSync(join(root, 'src/data/levelbridge-data.json'), 'utf8'));

// 1. Update meta
const meta = {
  name: "LevelBridge starter data",
  subject: "Maths (Class 3-10 continuous progression)",
  note: "Starter content to be reviewed by a teacher. Original questions written for this project. Wrong options carry a mistake tag used for the rule-based 'why was this wrong' explanation."
};

// 2. Extend levels to 10
const newLevels = [
  ...existing.levels.map(l => l.id === 5 ? { ...l, name: "Fractions" } : l),
  {
    id: 6,
    name: "Decimals and percentages",
    prerequisites: [5],
    teacherActivity: {
      minutes: 15,
      title: "10x10 Hundred-grid shading",
      steps: [
        "Draw a 10x10 square grid on slate or grid paper (100 total squares).",
        "Shade 25 squares: show that 25/100 is 0.25 as a decimal and 25% as a percentage.",
        "Practice with 50% (half = 0.5) and 10% (one row = 0.1)."
      ]
    },
    selfPractice: "Convert a set of 5 common fractions (1/2, 1/4, 3/4, 1/10, 1/5) into decimals and percentages."
  },
  {
    id: 7,
    name: "Ratio and proportion",
    prerequisites: [3, 6],
    teacherActivity: {
      minutes: 15,
      title: "Beads and recipe sharing",
      steps: [
        "Make a necklace with 2 red beads for every 3 blue beads (ratio 2:3).",
        "Scale up: if we want 4 red beads, how many blue beads do we need? Show 2x scale = 6 blue.",
        "Link to sharing: divide 15 seeds in ratio 1:2 into two bowls (5 and 10)."
      ]
    },
    selfPractice: "Given a recipe card for 2 people, scale all ingredient quantities up for 4 and 6 people."
  },
  {
    id: 8,
    name: "Algebra basics",
    prerequisites: [7],
    teacherActivity: {
      minutes: 15,
      title: "Mystery cup and pebble expressions",
      steps: [
        "Place a paper cup labeled 'x' with unknown pebbles inside, plus 3 loose pebbles beside it.",
        "Write the expression 'x + 3'. Explain that 'x' represents an unknown quantity.",
        "Combine terms: show 2 cups plus 3 cups is 5 cups (2x + 3x = 5x), but cups and loose pebbles cannot be added together."
      ]
    },
    selfPractice: "Simplify 6 expressions by grouping like terms (e.g. 3x + 2 + 2x + 5)."
  },
  {
    id: 9,
    name: "Linear equations",
    prerequisites: [8, 2],
    teacherActivity: {
      minutes: 15,
      title: "Two-pan balance scale",
      steps: [
        "Draw a balance scale: left pan has 2 cups (2x) and 3 pebbles (+3); right pan has 11 pebbles.",
        "Keep it balanced: remove 3 pebbles from both sides (2x = 8).",
        "Divide both sides equally: each cup must hold 4 pebbles (x = 4)."
      ]
    },
    selfPractice: "Solve 5 one-step and two-step linear equations on slates, checking each answer by substituting back."
  },
  {
    id: 10,
    name: "Geometry basics (area, Pythagoras)",
    prerequisites: [9, 3],
    teacherActivity: {
      minutes: 15,
      title: "Square tile grids and 3-4-5 rope triangles",
      steps: [
        "Area: cover a 4 cm by 3 cm rectangle with 1 cm square paper tiles to show Area = 4 x 3 = 12.",
        "Right triangles: tie 12 equal knots in a loop of string and form a 3-4-5 right triangle.",
        "Show 3^2 + 4^2 = 9 + 16 = 25 = 5^2. The square on the hypotenuse equals the sum of squares on the legs."
      ]
    },
    selfPractice: "Find the area of rectangles and the missing hypotenuse or side of 3-4-5 and 6-8-10 right triangles."
  }
];

// 3. New mistake tags
const newMistakeTags = {
  ...existing.mistakeTags,
  decimal_uses_denominator: {
    label: "Used the denominator directly as a decimal",
    explanation: "1/2 is not 0.2. A half is five tenths, so 1/2 = 0.5. Divide 1 by 2 to find the decimal."
  },
  place_value_decimal: {
    label: "Decimal place value slip",
    explanation: "Check the position after the decimal point: the first place is tenths, the second place is hundredths."
  },
  decimal_from_digits: {
    label: "Placed digits before and after the dot",
    explanation: "1/2 means 1 divided by 2 (0.5), not 1.2. A fraction less than 1 always has 0 before the decimal point."
  },
  percent_as_fraction_denominator: {
    label: "Put the percentage directly under 1",
    explanation: "25% means 25 out of 100 (25/100). Simplify 25/100 by dividing top and bottom by 25 to get 1/4."
  },
  digits_as_fraction: {
    label: "Used digits directly as fraction",
    explanation: "25% is not 2/5. 25% = 25/100 = 1/4, whereas 2/5 is 40%."
  },
  half_confusion: {
    label: "Confused with one half",
    explanation: "One half is 50%, while 25% is half of a half (one quarter, 1/4)."
  },
  percent_as_decimal_shift: {
    label: "Shifted decimal point by wrong number of places",
    explanation: "To turn a decimal to a percentage, multiply by 100 (shift the decimal point 2 places right): 0.7 becomes 70%, not 7%."
  },
  no_conversion: {
    label: "Added percent symbol without multiplying by 100",
    explanation: "0.7 is 7 tenths, which is 70 hundredths (70%). Remember to multiply by 100 when adding the % sign."
  },
  multiplied_by_too_much: {
    label: "Multiplied by 1000 instead of 100",
    explanation: "Percent means out of 100. Multiply by 100, not 1000."
  },
  ignored_decimal_point: {
    label: "Ignored the decimal point",
    explanation: "0.4 and 0.3 are tenths. 4 tenths plus 3 tenths is 7 tenths (0.7), not 7 whole units."
  },
  multiplied_by_percent: {
    label: "Multiplied instead of taking percentage",
    explanation: "10% of 50 means 10/100 x 50 = 5. Do not just multiply 10 x 50."
  },
  divided_by_too_much: {
    label: "Divided by 100 twice",
    explanation: "10% of 50 is 50 divided by 10, which gives 5."
  },
  subtracted_percent: {
    label: "Subtracted percentage number directly",
    explanation: "10% is a fraction of the amount, not an amount to subtract directly."
  },
  ratio_order_swapped: {
    label: "Swapped the order of the ratio terms",
    explanation: "The order in a ratio matters. If boys are mentioned first, the boys' count comes first."
  },
  part_to_whole_instead: {
    label: "Gave part-to-whole instead of part-to-part",
    explanation: "The question asks for boys to girls (2:3), not boys to the whole class (2:5)."
  },
  whole_to_part_instead: {
    label: "Gave whole-to-part ratio",
    explanation: "Check which quantities are being compared: compare the two parts directly."
  },
  divided_only_one_term: {
    label: "Divided only one part of the ratio",
    explanation: "Both numbers in a ratio must be divided by the same number to simplify: 6 and 8 both divide by 2 to give 3:4."
  },
  wrong_divisor: {
    label: "Used wrong common factor",
    explanation: "Divide both 6 and 8 by their greatest common factor, which is 2."
  },
  multiplied_by_wrong_factor: {
    label: "Scaled by wrong multiplier",
    explanation: "If a = 2 becomes 6, it was multiplied by 3. So b = 5 must also be multiplied by 3 (5 x 3 = 15)."
  },
  added_difference: {
    label: "Added difference instead of scaling proportionally",
    explanation: "In ratios we multiply, not add. Going from 2 to 6 means multiplying by 3, so multiply 5 by 3."
  },
  added_terms: {
    label: "Added ratio numbers together",
    explanation: "Use proportions: if the first term is tripled, the second term must also be tripled."
  },
  gave_larger_share: {
    label: "Gave the other person's share",
    explanation: "Ali's share is 1 part and Dev's is 3 parts. 1 part is 3 sweets, while 9 sweets is Dev's share."
  },
  divided_by_ratio_term: {
    label: "Divided total by one term instead of total parts",
    explanation: "Find the total parts first: 1 + 3 = 4 parts. Then divide 12 by 4 to get 3 sweets per part."
  },
  divided_equally: {
    label: "Divided equally instead of using the ratio",
    explanation: "The sweets are shared in ratio 1:3, not equally in half."
  },
  multiplied_variables: {
    label: "Multiplied variable instead of adding like terms",
    explanation: "When adding like terms (3x + 2x), add the numbers in front: 3 + 2 = 5, so 5x. Do not change the power to x^2."
  },
  multiplies_coefficients: {
    label: "Multiplied coefficients instead of adding",
    explanation: "The plus sign means add: 3 + 2 = 5, not 3 x 2 = 6."
  },
  dropped_variable: {
    label: "Dropped the variable letter",
    explanation: "Keep the variable with its coefficient: 3x + 2x is 5x, not just the number 5."
  },
  concatenates_digits: {
    label: "Wrote digits side by side instead of multiplying",
    explanation: "2x means 2 times x. If x = 4, 2x is 2 x 4 = 8, not twenty-four."
  },
  adds_before_multiplying: {
    label: "Added before multiplying",
    explanation: "Follow order of operations: multiply 2 times 4 first to get 8, then add 3 to get 11."
  },
  combined_unlike_terms: {
    label: "Combined unlike terms",
    explanation: "You can only add terms with the same letter together. 4a and 2a make 6a, but 3b must stay separate: 6a + 3b."
  },
  added_all_coefficients: {
    label: "Added all numbers ignoring variable letters",
    explanation: "Only terms with the same variable letter can be combined. 'a' terms and 'b' terms cannot be mixed."
  },
  sign_error: {
    label: "Sign error",
    explanation: "Watch positive and negative signs carefully. Moving a term or subtracting changes the sign."
  },
  only_distributed_first_term: {
    label: "Multiplied only the first term inside brackets",
    explanation: "The number outside multiplies EVERYTHING inside: 3(x + 2) = 3(x) + 3(2) = 3x + 6."
  },
  added_instead_of_multiplied: {
    label: "Added the outside number instead of multiplying",
    explanation: "Brackets mean multiplication: 3 times 2 is 6, not 3 + 2 = 5."
  },
  dropped_first_coefficient: {
    label: "Forgot to multiply the variable term",
    explanation: "Remember that 3 multiplies x as well as the 2, giving 3x + 6."
  },
  added_instead_of_subtracted: {
    label: "Added instead of subtracting to undo operation",
    explanation: "To undo +7, subtract 7 from both sides: 15 - 7 = 8."
  },
  copied_constant: {
    label: "Copied a number from the equation",
    explanation: "Solve by balancing both sides: subtract 7 from 15 to find x."
  },
  divided_before_subtracting: {
    label: "Divided before undoing addition",
    explanation: "In 2x + 5 = 17, subtract 5 from both sides first (2x = 12), then divide by 2 (x = 6)."
  },
  forgot_to_divide: {
    label: "Forgot to divide by the coefficient",
    explanation: "After finding 4x = 16, divide by 4 to get x = 4."
  },
  only_one_side: {
    label: "Changed only one side of the equation",
    explanation: "Whatever you do to one side of the equation, you must do to the other side to keep it balanced."
  },
  area_perimeter_confusion: {
    label: "Confused area with perimeter",
    explanation: "Area is space inside (length x width). Perimeter is distance around the outside (2 x length + 2 x width)."
  },
  added_length_and_width: {
    label: "Added length and width instead of multiplying",
    explanation: "Area of a rectangle is length multiplied by width: 6 x 4 = 24."
  },
  multiplied_by_two: {
    label: "Multiplied by two incorrectly",
    explanation: "Check the formula: Area = length x width."
  },
  half_perimeter: {
    label: "Added length and width once without doubling",
    explanation: "A rectangle has 4 sides: 2 lengths and 2 widths. Perimeter = 2 x (5 + 3) = 16 cm."
  },
  pythagoras_added_not_squared: {
    label: "Added side lengths without squaring them",
    explanation: "Pythagoras theorem uses squares: a^2 + b^2 = c^2. 3^2 + 4^2 = 9 + 16 = 25, and sqrt(25) = 5."
  },
  forgot_square_root: {
    label: "Forgot to take square root at the end",
    explanation: "c^2 = 25, so take the square root to find c: sqrt(25) = 5."
  },
  multiplied_legs: {
    label: "Multiplied side lengths instead of using Pythagoras",
    explanation: "For the hypotenuse, square both sides, add them, and take the square root."
  },
  forgot_half_factor: {
    label: "Forgot to divide by 2 for triangle area",
    explanation: "The area of a triangle is half of base x height: (6 x 4) / 2 = 24 / 2 = 12."
  },
  added_base_and_height: {
    label: "Added base and height instead of calculating area",
    explanation: "Area of a triangle is (base x height) / 2: (6 x 4) / 2 = 12."
  },
  perimeter_confusion: {
    label: "Calculated perimeter instead of area",
    explanation: "Use Area = (base x height) / 2 for triangles."
  },
  pythagoras_subtracted_not_squared: {
    label: "Subtracted lengths directly instead of squaring",
    explanation: "To find a shorter side, subtract squares: 10^2 - 6^2 = 100 - 36 = 64, then sqrt(64) = 8."
  }
};

// 4. New questions
const newQuestions = [
  ...existing.questions,
  // Level 6
  {
    id: "L6Q1", level: 6,
    prompt: "What is 1/2 written as a decimal?",
    options: ["0.5", "0.2", "0.05", "1.2"],
    answer: "0.5",
    wrongTags: { "0.2": "decimal_uses_denominator", "0.05": "place_value_decimal", "1.2": "decimal_from_digits" }
  },
  {
    id: "L6Q2", level: 6,
    prompt: "What is 25% written as a fraction in simplest form?",
    options: ["1/4", "1/25", "2/5", "1/2"],
    answer: "1/4",
    wrongTags: { "1/25": "percent_as_fraction_denominator", "2/5": "digits_as_fraction", "1/2": "half_confusion" }
  },
  {
    id: "L6Q3", level: 6,
    prompt: "What is 0.7 written as a percentage?",
    options: ["70%", "7%", "0.7%", "700%"],
    answer: "70%",
    wrongTags: { "7%": "percent_as_decimal_shift", "0.7%": "no_conversion", "700%": "multiplied_by_too_much" }
  },
  {
    id: "L6Q4", level: 6,
    prompt: "0.4 + 0.3 = ?",
    options: ["0.7", "0.07", "0.12", "7"],
    answer: "0.7",
    wrongTags: { "0.07": "place_value_decimal", "0.12": "multiplies_instead", "7": "ignored_decimal_point" }
  },
  {
    id: "L6Q5", level: 6,
    prompt: "What is 10% of 50?",
    options: ["5", "500", "0.5", "40"],
    answer: "5",
    wrongTags: { "500": "multiplied_by_percent", "0.5": "divided_by_too_much", "40": "subtracted_percent" }
  },

  // Level 7
  {
    id: "L7Q1", level: 7,
    prompt: "In a class there are 2 boys for every 3 girls. What is the ratio of boys to girls?",
    options: ["2:3", "3:2", "2:5", "5:2"],
    answer: "2:3",
    wrongTags: { "3:2": "ratio_order_swapped", "2:5": "part_to_whole_instead", "5:2": "whole_to_part_instead" }
  },
  {
    id: "L7Q2", level: 7,
    prompt: "If 1 pen costs 5 rupees, how much do 4 pens cost?",
    options: ["20", "9", "1", "25"],
    answer: "20",
    wrongTags: { "9": "adds_instead", "1": "subtracts_instead", "25": "table_confusion" }
  },
  {
    id: "L7Q3", level: 7,
    prompt: "Simplify the ratio 6:8 to lowest terms.",
    options: ["3:4", "4:3", "6:4", "2:3"],
    answer: "3:4",
    wrongTags: { "4:3": "ratio_order_swapped", "6:4": "divided_only_one_term", "2:3": "wrong_divisor" }
  },
  {
    id: "L7Q4", level: 7,
    prompt: "If a:b = 2:5 and a = 6, what is b?",
    options: ["15", "10", "12", "7"],
    answer: "15",
    wrongTags: { "10": "multiplied_by_wrong_factor", "12": "added_difference", "7": "added_terms" }
  },
  {
    id: "L7Q5", level: 7,
    prompt: "Share 12 sweets between Ali and Dev in the ratio 1:3. How many sweets does Ali get?",
    options: ["3", "9", "4", "6"],
    answer: "3",
    wrongTags: { "9": "gave_larger_share", "4": "divided_by_ratio_term", "6": "divided_equally" }
  },

  // Level 8
  {
    id: "L8Q1", level: 8,
    prompt: "Simplify: 3x + 2x",
    options: ["5x", "5x^2", "6x", "5"],
    answer: "5x",
    wrongTags: { "5x^2": "multiplied_variables", "6x": "multiplies_coefficients", "5": "dropped_variable" }
  },
  {
    id: "L8Q2", level: 8,
    prompt: "If x = 4, what is the value of 2x + 3?",
    options: ["11", "9", "27", "14"],
    answer: "11",
    wrongTags: { "9": "adds_instead", "27": "concatenates_digits", "14": "adds_before_multiplying" }
  },
  {
    id: "L8Q3", level: 8,
    prompt: "Simplify: 4a + 3b + 2a",
    options: ["6a + 3b", "9ab", "6a + 3", "9a + b"],
    answer: "6a + 3b",
    wrongTags: { "9ab": "combined_unlike_terms", "6a + 3": "dropped_variable", "9a + b": "added_all_coefficients" }
  },
  {
    id: "L8Q4", level: 8,
    prompt: "Simplify: 5y - 2y + 4",
    options: ["3y + 4", "7y", "3y - 4", "7"],
    answer: "3y + 4",
    wrongTags: { "7y": "combined_unlike_terms", "3y - 4": "sign_error", "7": "dropped_variable" }
  },
  {
    id: "L8Q5", level: 8,
    prompt: "What does 3(x + 2) expand to?",
    options: ["3x + 6", "3x + 2", "3x + 5", "x + 6"],
    answer: "3x + 6",
    wrongTags: { "3x + 2": "only_distributed_first_term", "3x + 5": "added_instead_of_multiplied", "x + 6": "dropped_first_coefficient" }
  },

  // Level 9
  {
    id: "L9Q1", level: 9,
    prompt: "Solve for x: x + 7 = 15",
    options: ["8", "22", "10", "7"],
    answer: "8",
    wrongTags: { "22": "added_instead_of_subtracted", "10": "calculation_slip", "7": "copied_constant" }
  },
  {
    id: "L9Q2", level: 9,
    prompt: "Solve for x: 3x = 18",
    options: ["6", "15", "54", "21"],
    answer: "6",
    wrongTags: { "15": "subtracts_instead", "54": "multiplies_instead", "21": "adds_instead" }
  },
  {
    id: "L9Q3", level: 9,
    prompt: "Solve for x: 2x + 5 = 17",
    options: ["6", "11", "24", "4"],
    answer: "6",
    wrongTags: { "11": "added_instead_of_subtracted", "24": "multiplies_instead", "4": "divided_before_subtracting" }
  },
  {
    id: "L9Q4", level: 9,
    prompt: "Solve for x: 4x - 3 = 13",
    options: ["4", "2.5", "16", "5"],
    answer: "4",
    wrongTags: { "2.5": "sign_error", "16": "forgot_to_divide", "5": "calculation_slip" }
  },
  {
    id: "L9Q5", level: 9,
    prompt: "Solve for x: 5x + 2 = 3x + 10",
    options: ["4", "6", "1", "8"],
    answer: "4",
    wrongTags: { "6": "only_one_side", "1": "sign_error", "8": "forgot_to_divide" }
  },

  // Level 10
  {
    id: "L10Q1", level: 10,
    prompt: "A rectangle has length 6 cm and width 4 cm. What is its area?",
    options: ["24 cm^2", "20 cm^2", "10 cm^2", "48 cm^2"],
    answer: "24 cm^2",
    wrongTags: { "20 cm^2": "area_perimeter_confusion", "10 cm^2": "added_length_and_width", "48 cm^2": "multiplied_by_two" }
  },
  {
    id: "L10Q2", level: 10,
    prompt: "What is the perimeter of a rectangle with length 5 cm and width 3 cm?",
    options: ["16 cm", "15 cm", "8 cm", "30 cm"],
    answer: "16 cm",
    wrongTags: { "15 cm": "area_perimeter_confusion", "8 cm": "half_perimeter", "30 cm": "multiplied_by_two" }
  },
  {
    id: "L10Q3", level: 10,
    prompt: "In a right triangle, the two shorter sides are 3 and 4. What is the length of the hypotenuse?",
    options: ["5", "7", "25", "12"],
    answer: "5",
    wrongTags: { "7": "pythagoras_added_not_squared", "25": "forgot_square_root", "12": "multiplied_legs" }
  },
  {
    id: "L10Q4", level: 10,
    prompt: "What is the area of a right triangle with base 6 and height 4?",
    options: ["12", "24", "10", "20"],
    answer: "12",
    wrongTags: { "24": "forgot_half_factor", "10": "added_base_and_height", "20": "perimeter_confusion" }
  },
  {
    id: "L10Q5", level: 10,
    prompt: "In a right triangle, the hypotenuse is 10 and one side is 6. What is the other side?",
    options: ["8", "4", "16", "64"],
    answer: "8",
    wrongTags: { "4": "pythagoras_subtracted_not_squared", "16": "added_instead_of_subtracted", "64": "forgot_square_root" }
  }
];

// Validate everything
console.log(`Levels: ${newLevels.length}`);
console.log(`Questions: ${newQuestions.length}`);

for (const q of newQuestions) {
  if (q.options.length !== 4) throw new Error(`Question ${q.id} has ${q.options.length} options`);
  if (new Set(q.options).size !== 4) throw new Error(`Question ${q.id} has duplicate options: ${q.options}`);
  if (!q.options.includes(q.answer)) throw new Error(`Question ${q.id} answer ${q.answer} not in options`);
  const wrong = q.options.filter(o => o !== q.answer);
  for (const w of wrong) {
    const tag = q.wrongTags[w];
    if (!tag) throw new Error(`Question ${q.id} missing wrong tag for ${w}`);
    if (!newMistakeTags[tag]) throw new Error(`Question ${q.id} tag '${tag}' not in mistakeTags`);
  }
}

const finalData = {
  meta,
  levels: newLevels,
  mistakeTags: newMistakeTags,
  questions: newQuestions
};

writeFileSync(join(root, 'src/data/levelbridge-data.json'), JSON.stringify(finalData, null, 2));
console.log('Successfully wrote extended levelbridge-data.json!');
