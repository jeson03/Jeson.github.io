import { describe, it, expect } from 'vitest';
import { codonTable } from '../src/core/codon-table.js';

describe('codon-table', () => {
    it('should have 64 codons', () => {
        expect(Object.keys(codonTable)).toHaveLength(64);
    });

    it('should map ATG to Methionine (M)', () => {
        expect(codonTable['ATG']).toBe('M');
    });

    it('should have three stop codons', () => {
        const stops = Object.entries(codonTable).filter(([, aa]) => aa === '*');
        expect(stops).toHaveLength(3);
        expect(stops.map(([c]) => c).sort()).toEqual(['TAA', 'TAG', 'TGA']);
    });

    it('should map all codons to valid amino acids', () => {
        const validAA = new Set('ACDEFGHIKLMNPQRSTVWY*');
        for (const [, aa] of Object.entries(codonTable)) {
            expect(validAA.has(aa)).toBe(true);
        }
    });

    it('should have 6 Leucine codons', () => {
        const leuCodons = Object.entries(codonTable)
            .filter(([, aa]) => aa === 'L')
            .map(([c]) => c);
        expect(leuCodons).toHaveLength(6);
    });

    it('should have degenerate codons for Serine (6 codons)', () => {
        const serCodons = Object.entries(codonTable)
            .filter(([, aa]) => aa === 'S')
            .map(([c]) => c);
        expect(serCodons).toHaveLength(6);
    });

    it('should map TGG to Tryptophan (W) - only codon for W', () => {
        expect(codonTable['TGG']).toBe('W');
        const trpCodons = Object.entries(codonTable).filter(([, aa]) => aa === 'W');
        expect(trpCodons).toHaveLength(1);
    });
});
