import { codonTable } from './codon-table.js';
import { cleanSequence, reverseComplement } from './dna-utils.js';

export function translateFrame(dna, frame) {
    let aa = '';
    for (let i = frame; i + 3 <= dna.length; i += 3) {
        const codon = dna.substring(i, i + 3);
        aa += codonTable[codon] || 'X';
    }
    return aa;
}

export function generateSixFrames(rawInput) {
    const dna = cleanSequence(rawInput);
    if (dna.length === 0) return { dna, frames: [] };

    const reverseDna = reverseComplement(dna);
    const frames = [
        { label: '正链 框1 ➡️', dna: dna, frame: 0, cssClass: 'forward-1' },
        { label: '正链 框2 ➡️', dna: dna, frame: 1, cssClass: 'forward-2' },
        { label: '正链 框3 ➡️', dna: dna, frame: 2, cssClass: 'forward-3' },
        { label: '反链 框1 ⬅️', dna: reverseDna, frame: 0, cssClass: 'reverse-1' },
        { label: '反链 框2 ⬅️', dna: reverseDna, frame: 1, cssClass: 'reverse-2' },
        { label: '反链 框3 ⬅️', dna: reverseDna, frame: 2, cssClass: 'reverse-3' }
    ];

    const results = frames.map(info => ({
        label: info.label,
        cssClass: info.cssClass,
        aaSequence: translateFrame(info.dna, info.frame)
    }));

    return { dna, frames: results };
}