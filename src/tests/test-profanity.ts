import { Filter } from "profanity-check";

const defaultFilter = new Filter();

// Custom profanity checker that uses a simple regex-based approach
function isProfane(text: string): boolean {
    // First check if the default filter finds any exact matches
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];

    // Only flag a word as profane if it exactly matches a profane word
    // This prevents flagging words like "class" or "assembly"
    return words.some(word => {
        // Skip common false positives
        const safeWords = new Set([
            'class', 'bass', 'brass', 'grass', 'mass', 'pass', 'assemble', 'assembly', 'crass',
            'assignment', 'field', 'assist', 'assign', 'assume', 'assassin', 'associate', 'association'
        ]);

        // Check if the word itself or any common variations are in the safe list
        if (safeWords.has(word) || Array.from(safeWords).some(safe => word.startsWith(safe))) {
            return false;
        }

        return defaultFilter.isProfane(word);
    });
}

// Test cases
const testCases = [
    // Common words that should be safe
    "bass guitar",
    "crass behavior",
    "assemble the team",
    "pass the test",
    "mass production",
    "class time",
    "brass band",
    "grass field",
    // actual profanity test
    "bad word ass here",
    "another bad word: ass.",
    // Additional test cases
    "Hello, this is a normal message",
    "This message contains the word assembly",
    "Passing through the grass field",
    // Edge cases
    "assembly line worker",
    "brass assembly",
    "class assignment",
    // More edge cases
    "assignment due date",
    "field trip",
    "assistant manager",
    "assigned seating"
];

console.log("Testing profanity checker with improved word boundary awareness:");
console.log("===========================================================");

testCases.forEach(test => {
    console.log(`Testing: "${test}"`);
    console.log(`Result: ${isProfane(test) ? 'PROFANITY DETECTED ❌' : 'CLEAN ✅'}`);
    console.log("-----------------------------------------------------------");
});
