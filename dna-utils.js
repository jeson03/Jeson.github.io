export function cleanSequence(input) {
    return input.toUpperCase().replace(/[^ATCG]/g, '');
}

export function cleanAASequence(input) {
    return input.toUpperCase().replace(/[^A-Z\*]/g, '');
}

function getComplement(seq) {
    const map = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };
    return seq.split('').map(base => map[base] || base).join('');
}

export function reverseComplement(seq) {
    return getComplement(seq).split('').reverse().join('');
}

export function highlightAA(aaSeq) {
    return aaSeq
        .replace(/M/g, '<span class="aa-M">M</span>')
        .replace(/\*/g, '<span class="aa-stop">*</span>');
}