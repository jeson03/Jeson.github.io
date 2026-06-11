// FASTA 文件加载与坐标提取模块
// 标准主染色体名列表
const MAIN_CHROMOSOMES = new Set([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    'X',
    'Y',
    'MT',
    // 带 chr 前缀的版本
    'chr1',
    'chr2',
    'chr3',
    'chr4',
    'chr5',
    'chr6',
    'chr7',
    'chr8',
    'chr9',
    'chr10',
    'chr11',
    'chr12',
    'chr13',
    'chr14',
    'chr15',
    'chr16',
    'chr17',
    'chr18',
    'chr19',
    'chr20',
    'chr21',
    'chr22',
    'chrX',
    'chrY',
    'chrM',
    'chrMT',
]);
export function parseFAI(text) {
    const index = new Map();
    const lines = text.trim().split('\n');
    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 5) {
            const [name, length, offset, lineBases, lineWidth] = parts;
            index.set(name, {
                name,
                length: parseInt(length),
                offset: parseInt(offset),
                lineBases: parseInt(lineBases),
                lineWidth: parseInt(lineWidth),
            });
        }
    }
    return index;
}

/**
 * 获取主染色体数量（用于状态栏显示）
 * @param {Map} faiIndex - parseFAI 返回的索引
 * @returns {number} 主染色体数量
 */
export function countMainChromosomes(faiIndex) {
    let count = 0;
    for (const name of faiIndex.keys()) {
        if (MAIN_CHROMOSOMES.has(name)) count++;
    }
    return count || faiIndex.size; // 如果没匹配到，退回显示总数
}

export function parseCoordinate(input) {
    const match = input.trim().match(/^(.+?):(\d+)[.\-]{1,2}(\d+)$/);
    if (!match) return null;
    return {
        chrom: match[1],
        start: parseInt(match[2]),
        end: parseInt(match[3]),
    };
}

/**
 * 在索引中查找染色体条目，自动处理 chr 前缀差异
 * @param {Map} faiIndex - 索引
 * @param {string} chrom - 用户输入的染色体名
 * @returns {object|null} 索引条目或 null
 */
function findChromosomeEntry(faiIndex, chrom) {
    // 尝试完全匹配
    if (faiIndex.has(chrom)) return faiIndex.get(chrom);

    // 尝试添加 'chr' 前缀
    const withChr = 'chr' + chrom.replace(/^chr/i, '');
    if (faiIndex.has(withChr)) return faiIndex.get(withChr);

    // 尝试去掉 'chr' 前缀
    const withoutChr = chrom.replace(/^chr/i, '');
    if (faiIndex.has(withoutChr)) return faiIndex.get(withoutChr);

    // 都找不到则返回 null
    return null;
}

/**
 * 根据坐标从 FASTA 文件中提取序列
 * @param {File} faFile - 用户上传的 .fa 文件
 * @param {Map} faiIndex - parseFAI 解析得到的索引
 * @param {string} chrom - 染色体名
 * @param {number} start - 起始位置 (1-based)
 * @param {number} end - 结束位置 (1-based)
 * @returns {Promise<string>} 提取到的纯 DNA 序列
 */
export async function extractSequence(faFile, faiIndex, chrom, start, end) {
    const entry = findChromosomeEntry(faiIndex, chrom);
    if (!entry) {
        // 列出索引中所有染色体名供参考
        const avail = Array.from(faiIndex.keys()).slice(0, 10).join(', ');
        throw new Error(`染色体 "${chrom}" 未在索引中找到。索引中的染色体名示例：${avail}...`);
    }

    if (start < 1 || end > entry.length || start > end) {
        throw new Error(`坐标超出范围：${entry.name} 长度为 ${entry.length}`);
    }

    const lineWidth = entry.lineWidth;
    const lineBases = entry.lineBases;
    const startRow = Math.floor((start - 1) / lineBases);
    const bytesBeforeStart = entry.offset + startRow * lineWidth + ((start - 1) % lineBases);
    const endRow = Math.floor((end - 1) / lineBases);
    const bytesAfterEnd = entry.offset + endRow * lineWidth + ((end - 1) % lineBases) + 1;

    const slice = faFile.slice(bytesBeforeStart, bytesAfterEnd);
    const buffer = await slice.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    return text.replace(/[^ATCGatcg]/g, '').toUpperCase();
}
