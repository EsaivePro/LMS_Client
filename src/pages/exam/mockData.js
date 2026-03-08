const QUESTIONS = Array.from({ length: 30 }).map((_, i) => ({
    id: i + 1,
    text: `In star-star connected transformer. (Sample placeholder question ${i + 1})`,
    options: [
        `Line voltage is equal to phase voltage`,
        `Line voltage is equal to \u221a3 phage voltage`,
        `There is no line current`,
        `There flows no phase current`,
    ],
}));

export default QUESTIONS;
