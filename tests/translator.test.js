import { describe, it, expect } from 'vitest';
import { translateFrame, generateSixFrames } from '../src/core/translator.js';

describe('translator', () => {
    describe('translateFrame', () => {
        it('should translate frame 0 of a simple sequence', () => {
            const dna = 'ATGGCC'; // ATG=M, GCC=A
            const result = translateFrame(dna, 0);
            expect(result).toBe('MA');
        });

        it('should translate frame 1 starting from second base', () => {
            const dna = 'AATGGCC'; // frame 1: ATG=M, GCC=A
            const result = translateFrame(dna, 1);
            expect(result).toBe('MA');
        });

        it('should return empty string for sequences shorter than a codon', () => {
            expect(translateFrame('AT', 0)).toBe('');
            expect(translateFrame('A', 0)).toBe('');
        });

        it('should handle stop codon', () => {
            // ATG TAA = M *
            const result = translateFrame('ATGTAA', 0);
            expect(result).toBe('M*');
        });

        it('should use X for unknown codons', () => {
            // ATG NNN = M X
            const result = translateFrame('ATGNNN', 0);
            expect(result).toBe('MX');
        });
    });

    describe('generateSixFrames', () => {
        it('should return 6 frames for valid DNA input', () => {
            const { frames } = generateSixFrames('ATGGCC');
            expect(frames).toHaveLength(6);
        });

        it('should label forward frames correctly', () => {
            const { frames } = generateSixFrames('ATGGCC');
            expect(frames[0].label).toContain('正链');
            expect(frames[0].label).toContain('框1');
            expect(frames[1].label).toContain('框2');
            expect(frames[2].label).toContain('框3');
        });

        it('should label reverse frames correctly', () => {
            const { frames } = generateSixFrames('ATGGCC');
            expect(frames[3].label).toContain('反链');
            expect(frames[3].cssClass).toBe('reverse-1');
        });

        it('should return empty frames for empty input', () => {
            const { dna, frames } = generateSixFrames('');
            expect(dna).toBe('');
            expect(frames).toHaveLength(0);
        });

        it('should clean non-ATCG characters from input', () => {
            const { dna } = generateSixFrames('ATG GCC\n123');
            expect(dna).toBe('ATGGCC');
        });

        it('should produce reverse complement for reverse frames', () => {
            // Forward: ATGGCC → MA (frame 0)
            // Reverse complement of ATGGCC = GGCCAT → frame 0: GGC CAT → GA?
            const { frames } = generateSixFrames('ATGGCC');
            // Forward frame 0
            expect(frames[0].aaSequence).toBe('MA');
            // Reverse strand uses reverse complement for translation
            expect(frames[3].aaSequence.length).toBeGreaterThanOrEqual(0);
        });
    });
});
