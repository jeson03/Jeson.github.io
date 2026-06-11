// Ensembl REST API 示例序列下载模块

const ENSEMBL_API_BASE = 'https://rest.ensembl.org';

/**
 * 根据基因名查询基因基本信息（坐标、链方向）
 * @param {string} symbol - 基因名（如 TP53, BRCA1）
 * @returns {Promise<object>} { id, chrom, start, end, strand }
 */
export async function lookupGene(symbol) {
    const url = `${ENSEMBL_API_BASE}/lookup/symbol/homo_sapiens/${symbol}?content-type=application/json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`基因 "${symbol}" 未找到`);
    const data = await response.json();
    return {
        id: data.id,
        chrom: data.seq_region_name,
        start: data.start,
        end: data.end,
        strand: data.strand === 1 ? '+' : '-',
    };
}

/**
 * 根据染色体坐标和链方向获取 DNA 序列
 * @param {string} chrom - 染色体名（如 17）
 * @param {number} start - 起始位置
 * @param {number} end - 结束位置
 * @param {string} strand - 链方向，1 为正链，-1 为反链
 * @returns {Promise<string>} DNA 序列
 */
async function getSequence(chrom, start, end, strand) {
    const strandParam = strand === '+' ? '1' : '-1';
    const url = `${ENSEMBL_API_BASE}/sequence/region/homo_sapiens/${chrom}:${start}..${end}:${strandParam}?content-type=text/plain`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('序列获取失败');
    return response.text();
}

/**
 * 根据基因名获取编码序列（CDS）
 * 简化方案：获取基因的基因组区域，直接作为序列返回
 * @param {string} symbol - 基因名
 * @returns {Promise<object>} { symbol, sequence, chrom, start, end, strand }
 */
export async function fetchGeneSequence(symbol) {
    const gene = await lookupGene(symbol);
    // 获取基因区域的基因组序列（根据链方向获取正确的序列）
    const sequence = await getSequence(gene.chrom, gene.start, gene.end, gene.strand);

    return {
        symbol: symbol.toUpperCase(),
        sequence: sequence.replace(/[^ATCGatcg]/g, '').toUpperCase(),
        chrom: gene.chrom,
        start: gene.start,
        end: gene.end,
        strand: gene.strand,
    };
}

/**
 * 预置可下载的经典基因列表
 */
export const REMOTE_EXAMPLES = [
    { symbol: 'TP53', name: '🧬 TP53', desc: '抑癌基因p53，全长基因组序列，反链' },
    { symbol: 'BRCA1', name: '🎀 BRCA1', desc: '乳腺癌易感基因1' },
    { symbol: 'BRCA2', name: '🎀 BRCA2', desc: '乳腺癌易感基因2' },
    { symbol: 'EGFR', name: '🎯 EGFR', desc: '表皮生长因子受体，肺癌靶点' },
    { symbol: 'KRAS', name: '🎯 KRAS', desc: 'RAS家族原癌基因，胰腺癌热点' },
    { symbol: 'ALK', name: '🧬 ALK', desc: '间变性淋巴瘤激酶' },
    { symbol: 'PTEN', name: '🛡️ PTEN', desc: '磷酸酶和张力蛋白同源物，抑癌基因' },
    { symbol: 'APC', name: '🛡️ APC', desc: '腺瘤性息肉病基因，结直肠癌相关' },
    { symbol: 'MYC', name: '🎯 MYC', desc: '原癌基因转录因子' },
    { symbol: 'RB1', name: '🛡️ RB1', desc: '视网膜母细胞瘤蛋白，首个发现的抑癌基因' },
];
