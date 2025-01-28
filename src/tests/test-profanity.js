/* AI-generated tests - Profanity Checker
Problem still: this still doesn't search for all words that contain profane words as substring and I don't want to make an exhaustive list of all words (like "harass" or "lass") manually. I'll have to continue to revist the best approach for this. */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var profanity_check_1 = require("profanity-check");
var defaultFilter = new profanity_check_1.Filter();
// Custom profanity checker that uses a simple regex-based approach
function isProfane(text) {
    // First check if the default filter finds any exact matches
    var words = text.toLowerCase().match(/\b\w+\b/g) || [];
    // Only flag a word as profane if it exactly matches a profane word
    // This prevents flagging words like "class" or "assembly"
    return words.some(function (word) {
        // Skip common false positives
        var safeWords = new Set([
            'class', 'bass', 'brass', 'grass', 'mass', 'pass', 'assemble', 'assembly', 'crass',
            'assignment', 'field', 'assist', 'assign', 'assume', 'assassin', 'associate', 'association'
        ]);
        // Check if the word itself or any common variations are in the safe list
        if (safeWords.has(word) || Array.from(safeWords).some(function (safe) { return word.startsWith(safe); })) {
            return false;
        }
        return defaultFilter.isProfane(word);
    });
}
// Test cases
var testCases = [
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
testCases.forEach(function (test) {
    console.log("Testing: \"".concat(test, "\""));
    console.log("Result: ".concat(isProfane(test) ? 'PROFANITY DETECTED ❌' : 'CLEAN ✅'));
    console.log("-----------------------------------------------------------");
});


