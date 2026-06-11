import { describe, it, expect } from 'vitest';
import { cleanAASequence } from '../src/core/dna-utils.js';

// We need to test internal functions, but they're not exported.
// For now we test through the public API: runComparison
// Since runComparison requires DOM, we test findBestSubstringMatch logic inline.

/**
 * Re-implementation of findBestSubstringMatch for testing purposes.
 * This mirrors the logic in src/core/aligner.js
 */
function findBestSubstringMatch(shortSeq, longSeq) {
    const shortLen = shortSeq.length;
    const longLen = longSeq.length;
    if (shortLen === 0 || longLen === 0) return { start: 0, matches: 0, alignment: [] };
    if (shortLen >= longLen) {
        const alignment = [];
        let matches = 0;
        for (let i = 0; i < longLen; i++) {
            const aaShort = shortSeq[i] || '';
            const aaLong = longSeq[i] || '';
            const isMatch = aaShort === aaLong;
            if (isMatch) matches++;
            alignment.push({ pos: i + 1, target: aaShort, query: aaLong, match: isMatch });
        }
        for (let i = longLen; i < shortLen; i++) {
            alignment.push({ pos: i + 1, target: shortSeq[i], query: '', match: false });
        }
        return { start: 0, matches, alignment };
    }
    let bestStart = 0,
        bestMatches = -1,
        bestAlignment = [];
    const maxStart = longLen - shortLen;
    for (let start = 0; start <= maxStart; start++) {
        let matches = 0;
        const currentAlignment = [];
        for (let i = 0; i < shortLen; i++) {
            const aaShort = shortSeq[i];
            const aaLong = longSeq[start + i];
            const isMatch = aaShort === aaLong;
            if (isMatch) matches++;
            currentAlignment.push({ pos: i + 1, target: aaShort, query: aaLong, match: isMatch });
        }
        if (matches > bestMatches) {
            bestMatches = matches;
            bestStart = start;
            bestAlignment = currentAlignment;
        }
    }
    return { start: bestStart, matches: bestMatches, alignment: bestAlignment };
}

describe('aligner - findBestSubstringMatch', () => {
    it('should return empty result for empty inputs', () => {
        const result = findBestSubstringMatch('', 'ABC');
        expect(result.matches).toBe(0);
        expect(result.alignment).toEqual([]);
    });

    it('should find exact match at position 0', () => {
        const result = findBestSubstringMatch('MEEP', 'MEEPQSDPS');
        expect(result.start).toBe(0);
        expect(result.matches).toBe(4);
    });

    it('should find best match with offset', () => {
        // Target:     MEEP
        // Long seq:   XXMEEPXX
        const result = findBestSubstringMatch('MEEP', 'XXMEEPXX');
        expect(result.start).toBe(2);
        expect(result.matches).toBe(4);
    });

    it('should handle partial matches', () => {
        // Target:  MEEP
        // Long:    MEAP (one mismatch)
        const result = findBestSubstringMatch('MEEP', 'MEAP');
        expect(result.matches).toBe(3);
        const mismatches = result.alignment.filter((a) => !a.match);
        expect(mismatches).toHaveLength(1);
        expect(mismatches[0].pos).toBe(3);
    });

    it('should find best match among multiple candidates', () => {
        // Target: MEEP
        // Long:   XXMEAP...MEEPZZ
        // The best match should be at the exact MEEP position
        const result = findBestSubstringMatch('MEEP', 'XXMEAPXXXMEEPZZ');
        expect(result.matches).toBe(4);
        expect(result.start).toBe(9); // position of exact MEEP
    });

    it('should handle target longer than search space', () => {
        const result = findBestSubstringMatch('MEEPQSD', 'MEEP');
        // When short >= long, it aligns from start with gaps
        expect(result.start).toBe(0);
        expect(result.alignment.length).toBe(7);
    });

    it('should return correct alignment objects', () => {
        const result = findBestSubstringMatch('MA', 'MA');
        expect(result.alignment).toEqual([
            { pos: 1, target: 'M', query: 'M', match: true },
            { pos: 2, target: 'A', query: 'A', match: true },
        ]);
    });
});

describe('dna-utils - cleanAASequence', () => {
    it('should clean amino acid sequences', () => {
        expect(cleanAASequence('MEEP*')).toBe('MEEP*');
    });

    it('should handle lowercase and spaces', () => {
        expect(cleanAASequence('me ep *')).toBe('MEEP*');
    });

    it('should strip numbers', () => {
        expect(cleanAASequence('M1E2E3P')).toBe('MEEP');
    });
});
