import { Filter } from 'profanity-check';

// Initialize the filter once
const defaultFilter = new Filter();

// Custom profanity checker that uses a simple regex-based approach
export function isProfane(text: string): boolean {
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
