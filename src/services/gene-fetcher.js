// Ensembl REST API 基因查询模块
import { reverseComplement } from '../core/dna-utils.js';

const ENSEMBL_BASE = 'https://rest.ensembl.org';

async function lookupGeneId(symbol) {
    const url = `${ENSEMBL_BASE}/lookup/symbol/homo_sapiens/${symbol}?content-type=application/json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`基因 "${symbol}" 未找到`);
    const data = await response.json();
    return data.id;
}

async function getLongestCodingTranscript(geneId) {
    const url = `${ENSEMBL_BASE}/overlap/id/${geneId}?feature=transcript;content-type=application/json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取转录本失败');
    const transcripts = await response.json();

    const codingTranscripts = transcripts.filter((t) => t.biotype === 'protein_coding');
    if (codingTranscripts.length === 0) throw new Error('该基因没有蛋白质编码转录本');

    let best = null;
    let maxCDSLength = 0;
    for (const t of codingTranscripts) {
        const cdsLength = t.end - t.start + 1;
        if (cdsLength > maxCDSLength) {
            maxCDSLength = cdsLength;
            best = t;
        }
    }

    return {
        transcriptId: best.id,
        chrom: best.seq_region_name,
        start: best.start,
        end: best.end,
        strand: best.strand === 1 ? '+' : '-',
    };
}

async function getCDSExons(transcriptId) {
    const url = `${ENSEMBL_BASE}/lookup/id/${transcriptId}?expand=1;content-type=application/json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取转录本详情失败');
    const data = await response.json();

    const exons = data.Exon || [];
    if (!data.Translation) throw new Error('该转录本没有翻译注释');

    const cdsStart = data.Translation.start;
    const cdsEnd = data.Translation.end;

    const codingExons = [];
    for (const exon of exons) {
        const exonStart = exon.start;
        const exonEnd = exon.end;
        const overlapStart = Math.max(exonStart, cdsStart);
        const overlapEnd = Math.min(exonEnd, cdsEnd);
        if (overlapStart <= overlapEnd) {
            codingExons.push({ start: overlapStart, end: overlapEnd });
        }
    }

    if (data.strand === -1) {
        codingExons.reverse();
    }

    return codingExons;
}

async function extractCDS(faFile, faiIndex, chrom, exons, extractFunc) {
    let cdsSequence = '';
    for (const exon of exons) {
        const seq = await extractFunc(faFile, faiIndex, chrom, exon.start, exon.end);
        cdsSequence += seq;
    }
    return cdsSequence;
}

export async function fetchGeneCDS(geneSymbol, faFile, faiIndex, extractFunc) {
    const geneId = await lookupGeneId(geneSymbol);
    const transInfo = await getLongestCodingTranscript(geneId);
    const exons = await getCDSExons(transInfo.transcriptId);
    let cdsSeq = await extractCDS(faFile, faiIndex, transInfo.chrom, exons, extractFunc);

    // 反链基因需要反向互补，得到正确的编码链（mRNA 序列）
    if (transInfo.strand === '-') {
        cdsSeq = reverseComplement(cdsSeq);
    }

    return {
        sequence: cdsSeq,
        chrom: transInfo.chrom,
        start: transInfo.start,
        end: transInfo.end,
        strand: transInfo.strand,
    };
}
