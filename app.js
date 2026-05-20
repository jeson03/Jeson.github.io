import { renderSixFrame } from './ui-renderer.js';
import { parseFAI, parseCoordinate, extractSequence, countMainChromosomes } from './fasta-loader.js';
import { fetchGeneCDS } from './gene-fetcher.js';
import { fetchGeneSequence, REMOTE_EXAMPLES } from './api-examples.js';
import { saveHistory, getHistory, deleteHistory, clearHistory } from './history.js';
import { runComparison, exportComparisonText, exportComparisonImage } from './aligner.js';

let faiIndex = null;
let faFile = null;

// ---- 通用加载状态切换 ----
function setLoading(btn, loading, originalHTML) {
    if (loading) {
        btn.disabled = true;
        btn.dataset.originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> ' + (originalHTML || '处理中...');
    } else {
        btn.disabled = false;
        if (btn.dataset.originalHTML) {
            btn.innerHTML = btn.dataset.originalHTML;
            delete btn.dataset.originalHTML;
        }
    }
}

// ---- 示例序列库 ----
const EXAMPLES = {
    'tp53': {
        seq: 'ATGGAGGAGCCGCAGTCAGATCCTAGCGTCGAGCCCCCTCTGAGTCAGGAAACATTTTCAGACCTATGGAAACTACTTCCTGAAAACAACGTTCTGTCCCCCTTGCCGTCCCAAGCAATGGATGATTTGATGCTGTCCCCGGACGATATTGAACAATGGTTCACTGAAGACCCAGGTCCAGATGAAGCTCCCAGAATGCCAGAGGCTGCTCCCCGCGTGGCCCCTGCACCAGCAGCTCCTACACCGGCGGCCCCTGCACCAGCCCCCTCCTGGCCCCTGTCATCTTCTGTCCCTTCCCAGAAAACCTACCAGGGCAGCTACGGTTTCCGTCTGGGCTTCTTGCATTCTGGGACAGCCAAGTCTGTGACTTGCACGTACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGTGGGTTGATTCCACACCCCCGCCCGGCACCCGCGTCCGCGCCATGGCCATCTACAAGCAGTCACAGCACATGACGGAGGTTGTGAGGCGCTGCCCCCACCATGAGCGCTGCTCAGATAGCGATGGTCTGGCCCCTCCTCAGCATCTTATCCGAGTGGAAGGAAATTTGCGTGTGGAGTATTTGGATGACAGAAACACTTTTCGACATAGTGTGGTGGTGCCCTATGAGCCGCCTGAGGTTGGCTCTGACTGTACCACCATCCACTACAACTACATGTGTAACAGTTCCTGCATGGGCGGCATGAACCGGAGGCCCATCCTCACCATCATCACACTGGAAGACTCCAGTGGTAATCTACTGGGACGGAACAGCTTTGAGGTGCGTGTTTGTGCCTGTCCTGGGAGAGACCGGCGCACAGAGGAAGAGAATCTCCGCAAGAAAGGGGAGCCTCACCACGAGCTGCCCCCAGGGAGCACTAAGCGAGCACTGCCCAACAACACCAGCTCCTCTCCCCAGCCAAAGAAGAAACCACTGGATGGAGAATATTTCACCCTTCAGATCCGTGGGCGTGAGCGCTTCGAGATGTTCCGAGAGCTGAATGAGGCCTTGGAACTCAAGGATGCCCAGGCTGGGAAGGAGCCAGGGGGGAGCAGGGCTCACTCCAGCCACCTGAAGTCCAAAAAGGGTCAGTCTACCTCCCGCCATAAAAAACTCATGTTCAAGACAGAAGGGCCTGACTCAGACTGAC'
    },
    'dusp22-his': {
        seq: 'ATGGGCCATCATCATCATCATCACAGCAGCGGCCGCGGTGCGATGAGCAACGGCTGCATGAACAAGATCCTACCCATCCTGGGCTCCAACCGCTCCGTGCACCGCGAGGACTTCGAGGACGACTACGACGACGACGACGACGACGACGACGACTACGACGACGACGACGACTACGACGACGACGACTAAGTAA'
    },
    'brca1-fragment': {
        seq: 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGATATAACCAAAAGGAGCCTACAAGAAAGTACGAGATTTAGTCAACTTGTTGAAGAGCTATTGAAAATCATTTGTGCTTTTCAGCTTGACACAGGTTTGGAGTATGCAAACAGCTATAATTTTGCAAAAAAGGAAAATAACTCTCCTGAACATCTAAAAGATGAAGTTTCTATCATCCAAAGTATGGGCTACAGAAACCGTGCCAAAAGACTTCTACAGAGTGAACCCGAAAATCCTTCCTTGCAGGAAACCAGTCTCAGTGTCCAACTCTCTAACCTTGGAACTGTGAGAACTCTGAGGACAAAGCAGCGGATACAACCTCAAAAGACGTCTGGCTACATTGAAGTTGGGAGCTGAG'
    },
    'egfr-kinase': {
        seq: 'ATGCGACCCTCCGGGACGGCCGGGGCAGCGCTCCTGGCGCTGCTGGCTGCGCTCTGCCCGGCGAGTCGGGCTCTGGAGGAAAAGAAAGTTTGCCAAGGCACGAGTAACAAGCTCACGCAGTTGGGCACTTTTGAAGATCATTTTCTCAGCCTCCAGAGGATGTTCAATAACTGTGAGGTGGTCCTTGGGAATTTGGAAATTACCTATGTGCAGAGGAATTATGATCTTTCCTTCTTAAAGACCATCCAGGAGGTGGCTGGTTATGTCCTCATTGCCCTCAACACAGTGGAGCGAATTCCTTTGGAAAACCTGCAGATCATCAGAGGAAATATGTACTACGAAAATTCCTATGCCTTAGCAGTCTTATCTAACTATGATGCAAATAAAACCGGACTGAAGGAGCTGCCCATGAGAAATTTACAGGAAATCCTGCATGGCGCCGTGCGGTTCAGCAACAACCCTGCCCTGTGCAACGTGGAGAGCATCCAGTGGCGGGACATAGTCAGCAGTGACTTTCTCAGCAACATGTCGATGGACTTCCAGAACCACCTGGGCAGCTGCCAAAAGTGTGATCCAAGCTGTCCCAATGGGAGCTGCTGGGGTGCAGGAGAGGAGAACTGCCAGAAACTGACCAAAATCATCTGTGCCCAGCAGTGCTCCGGGCGCTGCCGTGGCAAGTCCCCCAGTGACTGCTGC'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const inputTextarea = document.querySelector('.main-panel textarea');
    const clearBtn = document.getElementById('clearBtn');
    const exampleBtn = document.getElementById('exampleBtn');
    const exampleMenu = document.getElementById('exampleMenu');
    const compareBtn = document.getElementById('compareBtn');

    // ---- 翻译功能 ----
    let translateTimer;
    inputTextarea.addEventListener('input', () => {
    clearTimeout(translateTimer);
    translateTimer = setTimeout(() => {
        renderSixFrame(inputTextarea.value);
    }, 300);
});

    clearBtn.addEventListener('click', () => {
        inputTextarea.value = '';
        renderSixFrame('');
    });

    // ---- 示例库下拉菜单 ----
    exampleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exampleMenu.classList.toggle('show');
    });

    // ========== 导航栏：示例库模态框 + 在线下载 ==========
const navExamples = document.getElementById('navExamples');
const exampleModal = document.getElementById('exampleModal');
const closeExampleModal = document.getElementById('closeExampleModal');

navExamples.addEventListener('click', (e) => {
    e.preventDefault();
    exampleModal.classList.add('show');
});

closeExampleModal.addEventListener('click', () => {
    exampleModal.classList.remove('show');
});

exampleModal.addEventListener('click', (e) => {
    if (e.target === exampleModal) exampleModal.classList.remove('show');
});

// 本地示例卡片点击
exampleModal.querySelectorAll('.example-card').forEach(card => {
    card.addEventListener('click', () => {
        const key = card.dataset.example;
        if (EXAMPLES[key]) {
            inputTextarea.value = EXAMPLES[key].seq;
            renderSixFrame(EXAMPLES[key].seq);
            // ✅ 保存历史
            saveHistory(`示例 ${key.toUpperCase()}`, EXAMPLES[key].seq, Math.floor(EXAMPLES[key].seq.length / 3));
        }
        exampleModal.classList.remove('show');
    });
});

// 在线基因下载
const remoteGeneGrid = document.getElementById('remoteGeneGrid');
const fetchRemoteBtn = document.getElementById('fetchRemoteBtn');
const remoteGeneInput = document.getElementById('remoteGeneInput');
const remoteStatus = document.getElementById('remoteStatus');

// 动态生成预置基因列表
if (typeof REMOTE_EXAMPLES !== 'undefined') {
    REMOTE_EXAMPLES.forEach(gene => {
        const chip = document.createElement('div');
        chip.className = 'remote-gene-chip';
        chip.innerHTML = `<div class="chip-symbol">${gene.name}</div><div class="chip-desc">${gene.desc}</div>`;
        chip.addEventListener('click', async () => {
            await loadRemoteGene(gene.symbol);
            exampleModal.classList.remove('show');
        });
        remoteGeneGrid.appendChild(chip);
    });
}

async function loadRemoteGene(symbol) {
    remoteStatus.textContent = `⏳ 正在从 Ensembl 下载 ${symbol}...`;
    remoteStatus.style.color = '#f0b90b';
    fetchRemoteBtn.disabled = true;
    try {
        const result = await fetchGeneSequence(symbol);
        inputTextarea.value = result.sequence;
        renderSixFrame(result.sequence);
        // ✅ 保存历史
        saveHistory(`在线下载 ${result.symbol}`, result.sequence, Math.floor(result.sequence.length / 3));
        const statusLeft = document.querySelector('.statusbar span:first-child');
        if (statusLeft) {
            statusLeft.textContent = `📂 在线下载 | 📍 ${result.symbol} (${result.chrom}:${result.start}-${result.end}, ${result.strand}链) | 长度: ${result.sequence.length}bp`;
        }
        remoteStatus.textContent = `✅ 已加载 ${result.symbol}（${result.sequence.length} bp）`;
        remoteStatus.style.color = '#00ff99';
    } catch (err) {
        remoteStatus.textContent = '❌ ' + err.message;
        remoteStatus.style.color = '#ff3355';
    } finally {
        fetchRemoteBtn.disabled = false;
    }
}

fetchRemoteBtn.addEventListener('click', async () => {
    const symbol = remoteGeneInput.value.trim().toUpperCase();
    if (!symbol) { alert('请输入基因名'); return; }
    await loadRemoteGene(symbol);
});

remoteGeneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchRemoteBtn.click();
});

// ========== 导航栏：帮助模态框 ==========
const navHelp = document.getElementById('navHelp');
const helpModal = document.getElementById('helpModal');
const closeHelpModal = document.getElementById('closeHelpModal');

navHelp.addEventListener('click', (e) => {
    e.preventDefault();
    helpModal.classList.add('show');
});

closeHelpModal.addEventListener('click', () => {
    helpModal.classList.remove('show');
});

helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.remove('show');
});

    document.addEventListener('click', (e) => {
        // 点击菜单外部时关闭
        if (!exampleBtn.contains(e.target) && !exampleMenu.contains(e.target)) {
            exampleMenu.classList.remove('show');
        }
    });

    // 事件委托：在菜单容器上监听点击，判断是否是 .dropdown-item
    exampleMenu.addEventListener('click', (e) => {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        const key = item.dataset.example;
        if (EXAMPLES[key]) {
            inputTextarea.value = EXAMPLES[key].seq;
            renderSixFrame(EXAMPLES[key].seq);
            // ✅ 保存历史
        saveHistory(`示例 ${key.toUpperCase()}`, EXAMPLES[key].seq, Math.floor(EXAMPLES[key].seq.length / 3));
        }
        exampleMenu.classList.remove('show');
    });

    if (compareBtn) {
        compareBtn.addEventListener('click', runComparison);
    }

    // ========== 导航栏：历史记录模态框 ==========
const navHistory = document.getElementById('navHistory');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('historyList');
const historyCount = document.getElementById('historyCount');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

function renderHistoryList() {
    const history = getHistory();
    historyList.innerHTML = '';
    historyCount.textContent = `共 ${history.length} 条记录`;

    if (history.length === 0) {
        historyList.innerHTML = '<div style="color:#667788; text-align:center; padding:40px;">暂无历史记录</div>';
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info">
                <div class="history-source">${item.source}</div>
                <div class="history-meta">
                    <span>📅 ${item.timestamp}</span>
                    <span>🧬 ${item.dnaLength} bp</span>
                    <span>🔤 ${item.aaLength} aa</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="btn load-btn" data-id="${item.id}">📂 加载</button>
                <button class="btn delete-btn" data-id="${item.id}">🗑️</button>
            </div>
        `;
        historyList.appendChild(div);
    });

    // 加载按钮事件
    historyList.querySelectorAll('.load-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const record = getHistory().find(r => r.id === id);
            if (record) {
                inputTextarea.value = record.sequence;
                renderSixFrame(record.sequence);
            }
            historyModal.classList.remove('show');
        });
    });

    // 删除按钮事件
    historyList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            deleteHistory(id);
            renderHistoryList();
        });
    });
}

navHistory.addEventListener('click', (e) => {
    e.preventDefault();
    renderHistoryList();
    historyModal.classList.add('show');
});

closeHistoryModal.addEventListener('click', () => {
    historyModal.classList.remove('show');
});

historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.classList.remove('show');
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('确定要清空全部历史记录吗？')) {
        clearHistory();
        renderHistoryList();
    }
});

    // ---- 清空比对结果 ----
    const clearCompareBtn = document.getElementById('clearCompareBtn');
    if (clearCompareBtn) {
        clearCompareBtn.addEventListener('click', () => {
            const compareInput = document.querySelector('.compare-input');
            const resultBox = document.querySelector('.result-box');
            if (compareInput) compareInput.value = '';
            if (resultBox) {
                resultBox.innerHTML = `
                    <div class="result-summary">✅ 最佳匹配：等待比对...</div>
                    <div style="margin-top:8px; color:#ccddee;">
                        <strong>目标：</strong> ...<br>
                        <strong>结果：</strong> ...
                    </div>
                `;
            }
        });
    }

    // ---- 复制/导出比对结果 ----
const copyCompareBtn = document.getElementById('copyCompareBtn');
const exportImageBtn = document.getElementById('exportImageBtn');

if (copyCompareBtn) {
    copyCompareBtn.addEventListener('click', () => {
        import('./aligner.js').then(module => {
            module.exportComparisonText();
        });
    });
}

if (exportImageBtn) {
    exportImageBtn.addEventListener('click', () => {
        import('./aligner.js').then(module => {
            module.exportComparisonImage();
        });
    });
}

    // ---- FASTA 文件加载 ----
    const faFileInput = document.getElementById('faFileInput');
    const faiFileInput = document.getElementById('faiFileInput');
    const faStatus = document.getElementById('faStatus');

    faFileInput.addEventListener('change', () => {
        faFile = faFileInput.files[0];
        if (faFile) faiFileInput.click();
    });

    faiFileInput.addEventListener('change', async () => {
        const faiFileObj = faiFileInput.files[0];
        if (!faiFileObj || !faFile) return;
        try {
            const faiText = await faiFileObj.text();
            faiIndex = parseFAI(faiText);
            faStatus.textContent = `✅ ${faFile.name} (${countMainChromosomes(faiIndex)} 条主染色体)`;
            faStatus.style.color = '#00ff99';
        } catch (err) {
            faStatus.textContent = '❌ 索引解析失败';
            faStatus.style.color = '#ff3355';
            console.error(err);
        }
    });

    // ---- 坐标提取 ----
    const extractBtn = document.getElementById('extractBtn');
    const coordInput = document.getElementById('coordInput');

    extractBtn.addEventListener('click', async () => {
        if (!faFile || !faiIndex) {
            alert('请先上传 .fa 文件和 .fai 索引文件');
            return;
        }
        const coord = parseCoordinate(coordInput.value);
        if (!coord) {
            alert('坐标格式错误，请使用格式：chr17:7668421-7687490');
            return;
        }
        setLoading(extractBtn, true, '提取中...');
        try {
            const seq = await extractSequence(faFile, faiIndex, coord.chrom, coord.start, coord.end);
            inputTextarea.value = seq;
            renderSixFrame(seq);
            // ✅ 保存历史
        saveHistory(`坐标提取 ${coord.chrom}:${coord.start}-${coord.end}`, seq, Math.floor(seq.length / 3));
            const statusLeft = document.querySelector('.statusbar span:first-child');
            if (statusLeft) {
                statusLeft.textContent = `📂 当前基因组：${faFile.name} (${countMainChromosomes(faiIndex)} 条主染色体) | 📍 ${coord.chrom}:${coord.start.toLocaleString()}-${coord.end.toLocaleString()}`;
            }
        } catch (err) {
            alert('提取失败：' + err.message);
        } finally {
            setLoading(extractBtn, false);
        }
    });

    // ---- 基因搜索 ----
    const geneSearchBtn = document.getElementById('geneSearchBtn');
    const geneInput = document.getElementById('geneInput');
    const geneStatus = document.getElementById('geneStatus');

    geneSearchBtn.addEventListener('click', async () => {
        if (!faFile || !faiIndex) {
            alert('请先上传 .fa 文件和 .fai 索引文件');
            return;
        }
        const symbol = geneInput.value.trim();
        if (!symbol) {
            alert('请输入基因名（如 TP53）');
            return;
        }
        geneStatus.textContent = '⏳ 查询中...';
        geneStatus.style.color = '#f0b90b';
        setLoading(geneSearchBtn, true, '搜索中...');
        try {
            const result = await fetchGeneCDS(symbol, faFile, faiIndex, extractSequence);
            inputTextarea.value = result.sequence;
            renderSixFrame(result.sequence);
            // ✅ 保存历史
        saveHistory(`基因搜索 ${symbol}`, result.sequence, Math.floor(result.sequence.length / 3));
            const statusLeft = document.querySelector('.statusbar span:first-child');
            if (statusLeft) {
                statusLeft.textContent = `📂 当前基因组：${faFile.name} | 📍 ${symbol} (${result.chrom}:${result.start}-${result.end}, ${result.strand}链)`;
            }
            geneStatus.textContent = `✅ 已加载 ${symbol}`;
            geneStatus.style.color = '#00ff99';
        } catch (err) {
            geneStatus.textContent = '❌ ' + err.message;
            geneStatus.style.color = '#ff3355';
        } finally {
            setLoading(geneSearchBtn, false);
        }
    });

    // 页面初始加载
    if (inputTextarea.value.trim() !== '') {
        renderSixFrame(inputTextarea.value);
    }
});