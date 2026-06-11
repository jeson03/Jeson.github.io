import { describe, it, expect } from 'vitest';
import {
    cleanSequence,
    cleanAASequence,
    reverseComplement,
    highlightAA,
} from '../src/core/dna-utils.js';

describe('dna-utils', () => {
    describe('cleanSequence', () => {
        it('should convert to uppercase and remove non-ATCG characters', () => {
            expect(cleanSequence('atcg')).toBe('ATCG');
        });

        it('should strip whitespace and numbers', () => {
            expect(cleanSequence('AT CG\n123')).toBe('ATCG');
        });

        it('should handle empty input', () => {
            expect(cleanSequence('')).toBe('');
        });

        it('should handle mixed case with special characters', () => {
            expect(cleanSequence('AtCg-Nn')).toBe('ATCG');
        });
    });

    describe('cleanAASequence', () => {
        it('should keep only uppercase letters and asterisk', () => {
            expect(cleanAASequence('MEEP*')).toBe('MEEP*');
        });

        it('should strip numbers and spaces', () => {
            expect(cleanAASequence('M E E P 123 *')).toBe('MEEP*');
        });
    });

    describe('reverseComplement', () => {
        it('should reverse complement a simple sequence', () => {
            // A↔T, C↔G
            expect(reverseComplement('ATCG')).toBe('CGAT');
        });

        it('should handle palindromic sequences', () => {
            // GAATTC → reverse complement → GAATTC (EcoRI site)
            expect(reverseComplement('GAATTC')).toBe('GAATTC');
        });

        it('should return empty for empty input', () => {
            expect(reverseComplement('')).toBe('');
        });

        it('should handle longer sequences correctly', () => {
            const seq = 'ATGGCC';
            // complement: TACCGG, reversed: GGCCAT
            expect(reverseComplement(seq)).toBe('GGCCAT');
        });
    });

    describe('highlightAA', () => {
        it('should wrap M in aa-M span', () => {
            expect(highlightAA('M')).toContain('class="aa-M"');
            expect(highlightAA('M')).toContain('>M</span>');
        });

        it('should wrap * in aa-stop span', () => {
            expect(highlightAA('*')).toContain('class="aa-stop"');
            expect(highlightAA('*')).toContain('>*</span>');
        });

        it('should leave other letters unchanged', () => {
            expect(highlightAA('ALG')).toBe('ALG');
        });
    });
});
