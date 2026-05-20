import { cleanAASequence } from './dna-utils.js';
import { getLastResults } from './ui-renderer.js';

window.lastComparison = null;

function compareAASequences(seq1, seq2) {
    const len = Math.min(seq1.length, seq2.length);
    let matchCount = 0;
    const alignment = [];
    for (let i = 0; i < len; i++) {
        const aa1 = seq1[i];
        const aa2 = seq2[i];
        const isMatch = (aa1 === aa2);
        if (isMatch) matchCount++;
        alignment.push({ pos: i + 1, target: aa1, query: aa2, match: isMatch });
    }
    const extraTarget = seq1.slice(len);
    const extraQuery = seq2.slice(len);
    return {
        matchCount,
        total: seq1.length,
        percentage: seq1.length > 0 ? (matchCount / seq1.length * 100).toFixed(1) : 0,
        alignment,
        extraTarget,
        extraQuery
    };
}

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
            const isMatch = (aaShort === aaLong);
            if (isMatch) matches++;
            alignment.push({ pos: i + 1, target: aaShort, query: aaLong, match: isMatch });
        }
        for (let i = longLen; i < shortLen; i++) {
            alignment.push({ pos: i + 1, target: shortSeq[i], query: '', match: false });
        }
        return { start: 0, matches, alignment };
    }
    let bestStart = 0, bestMatches = -1, bestAlignment = [];
    const maxStart = longLen - shortLen;
    for (let start = 0; start <= maxStart; start++) {
        let matches = 0;
        const currentAlignment = [];
        for (let i = 0; i < shortLen; i++) {
            const aaShort = shortSeq[i];
            const aaLong = longSeq[start + i];
            const isMatch = (aaShort === aaLong);
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

function buildAlignedSequence(alignment, type, plainText = false) {
    let html = '';
    if (!plainText) {
        html = '<span style="font-family: \'JetBrains Mono\', \'Fira Code\', monospace; font-size: 1.05em; letter-spacing: 0.3px;">';
    }
    alignment.forEach(item => {
        const aa = type === 'target' ? item.target : item.query;
        if (item.match) {
            html += aa;
        } else {
            if (plainText) {
                html += aa;
            } else {
                html += `<span class="diff-highlight">${aa}</span>`;
            }
        }
    });
    if (!plainText) html += '</span>';
    return html;
}

export function runComparison() {
    const targetInput = document.querySelector('.compare-input');
    if (!targetInput) return;
    const targetSeq = cleanAASequence(targetInput.value);
    if (targetSeq.length === 0) {
        alert('请在比对框中输入有效的氨基酸序列');
        return;
    }
    const frames = getLastResults();
    if (!frames || frames.length === 0) {
        alert('请先在左侧输入 DNA 序列并完成翻译');
        return;
    }

    let selectedFrames = frames;
    let manualLabel = null;
    const selectedRadio = document.querySelector('input[name="orfSelect"]:checked');
    if (selectedRadio && selectedRadio.value !== '') {
        const idx = parseInt(selectedRadio.value);
        if (idx >= 0 && idx < frames.length) {
            selectedFrames = [frames[idx]];
            manualLabel = frames[idx].label;
        }
    }

    let bestResult = null, bestFrame = null, bestScore = -1, bestSubStart = 0;

    selectedFrames.forEach(frame => {
        const { start, matches, alignment } = findBestSubstringMatch(targetSeq, frame.aaSequence);
        const matchPercent = targetSeq.length > 0 ? (matches / targetSeq.length * 100).toFixed(1) : 0;
        const matchRatio = parseFloat(matchPercent);
        if (matchRatio > bestScore) {
            bestScore = matchRatio;
            bestResult = { alignment, matchCount: matches, total: targetSeq.length, percentage: matchPercent };
            bestFrame = frame;
            bestSubStart = start;
        }
    });

    if (!bestFrame) return;

    const resultBox = document.querySelector('.result-box');
    if (!resultBox) return;

    const modeText = manualLabel ? `【手动选择：${manualLabel}】` : '【自动扫描】';

    let alignmentHTML = '<div style="margin-top:8px; font-family: monospace; font-size:0.85em;">';
    alignmentHTML += `<strong>目标片段：</strong> (长度 ${targetSeq.length})<br>`;
    alignmentHTML += buildAlignedSequence(bestResult.alignment, 'target');
    alignmentHTML += `<br><strong>最佳匹配区域 (${bestFrame.label}，起始位置 ${bestSubStart + 1})：</strong><br>`;
    alignmentHTML += buildAlignedSequence(bestResult.alignment, 'query');
    alignmentHTML += '</div>';

    resultBox.innerHTML = `
        <div class="result-summary">✅ 最佳匹配 ${modeText}：${bestFrame.label}，片段匹配度 ${bestResult.percentage}%</div>
        ${alignmentHTML}
    `;

    window.lastComparison = {
        summary: `最佳匹配 ${modeText}：${bestFrame.label}，片段匹配度 ${bestResult.percentage}%`,
        targetLabel: `目标片段 (长度 ${targetSeq.length})`,
        queryLabel: `最佳匹配区域 (${bestFrame.label}，起始位置 ${bestSubStart + 1})`,
        targetText: buildAlignedSequence(bestResult.alignment, 'target', true),
        queryText: buildAlignedSequence(bestResult.alignment, 'query', true),
        resultBoxRef: resultBox
    };
}

export function exportComparisonText() {
    const comp = window.lastComparison;
    if (!comp) {
        alert('请先进行比对');
        return;
    }
    const text = `${comp.summary}\n\n${comp.targetLabel}:\n${comp.targetText}\n\n${comp.queryLabel}:\n${comp.queryText}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ 比对报告已复制到剪贴板');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ 比对报告已复制到剪贴板');
    });
}

export function exportComparisonImage() {
    const comp = window.lastComparison;
    if (!comp || !comp.resultBoxRef) {
        alert('请先进行比对');
        return;
    }
    const element = comp.resultBoxRef;
    html2canvas(element, {
        backgroundColor: '#161c26',
        scale: 2
    }).then(canvas => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `比对结果_${new Date().toISOString().slice(0,10)}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }).catch(err => {
        alert('截图失败：' + err.message);
    });
}





// import { cleanAASequence } from './dna-utils.js';
// import { getLastResults } from './ui-renderer.js';

// /**
//  * 在长序列中寻找与短序列最佳匹配的子串位置
//  * 使用滑动窗口，返回 { start, matches, alignment }
//  */
// function findBestSubstringMatch(shortSeq, longSeq) {
//     const shortLen = shortSeq.length;
//     const longLen = longSeq.length;

//     if (shortLen === 0 || longLen === 0) {
//         return { start: 0, matches: 0, alignment: [] };
//     }

//     // 如果短序列比长序列还长，直接从头比对
//     if (shortLen >= longLen) {
//         const alignment = [];
//         let matches = 0;
//         for (let i = 0; i < longLen; i++) {
//             const aaShort = shortSeq[i] || '';
//             const aaLong = longSeq[i] || '';
//             const isMatch = (aaShort === aaLong);
//             if (isMatch) matches++;
//             alignment.push({ pos: i + 1, target: aaShort, query: aaLong, match: isMatch });
//         }
//         // 加上短序列多出的部分
//         for (let i = longLen; i < shortLen; i++) {
//             alignment.push({ pos: i + 1, target: shortSeq[i], query: '', match: false });
//         }
//         return { start: 0, matches, alignment };
//     }

//     let bestStart = 0;
//     let bestMatches = -1;
//     let bestAlignment = [];

//     const maxStart = longLen - shortLen;
//     for (let start = 0; start <= maxStart; start++) {
//         let matches = 0;
//         const currentAlignment = [];
//         for (let i = 0; i < shortLen; i++) {
//             const aaShort = shortSeq[i];
//             const aaLong = longSeq[start + i];
//             const isMatch = (aaShort === aaLong);
//             if (isMatch) matches++;
//             currentAlignment.push({ pos: i + 1, target: aaShort, query: aaLong, match: isMatch });
//         }
//         if (matches > bestMatches) {
//             bestMatches = matches;
//             bestStart = start;
//             bestAlignment = currentAlignment;
//         }
//     }

//     return { start: bestStart, matches: bestMatches, alignment: bestAlignment };
// }

// function buildAlignedSequence(alignment, type) {
//     // 用一个容器包裹序列，并直接设置较大的等宽字体和字号
//     let html = '<span style="font-family: \'JetBrains Mono\', \'Fira Code\', monospace; font-size: 0.95em; letter-spacing: 0.3px;">';
//     alignment.forEach(item => {
//         const aa = type === 'target' ? item.target : item.query;
//         if (item.match) {
//             html += aa;
//         } else {
//             html += `<span class="diff-highlight">${aa}</span>`;
//         }
//     });
//     html += '</span>';
//     return html;
// }

// export function runComparison() {
//     const targetInput = document.querySelector('.compare-input');
//     if (!targetInput) return;
//     const targetSeq = cleanAASequence(targetInput.value);
//     if (targetSeq.length === 0) {
//         alert('请在比对框中输入有效的氨基酸序列');
//         return;
//     }

//     const frames = getLastResults();
//     if (!frames || frames.length === 0) {
//         alert('请先在左侧输入 DNA 序列并完成翻译');
//         return;
//     }

//     let bestResult = null;
//     let bestFrame = null;
//     let bestScore = -1;
//     let bestSubStart = 0;

//     frames.forEach(frame => {
//         const { start, matches, alignment } = findBestSubstringMatch(targetSeq, frame.aaSequence);
//         const matchPercent = targetSeq.length > 0 ? (matches / targetSeq.length * 100).toFixed(1) : 0;
//         const matchRatio = parseFloat(matchPercent);
//         if (matchRatio > bestScore) {
//             bestScore = matchRatio;
//             bestResult = { alignment, matchCount: matches, total: targetSeq.length, percentage: matchPercent };
//             bestFrame = frame;
//             bestSubStart = start;
//         }
//     });

//     if (!bestFrame) return;

//     const resultBox = document.querySelector('.result-box');
//     if (!resultBox) return;

//     let alignmentHTML = '<div style="margin-top:8px; font-family: monospace; font-size:0.85em;">';
//     alignmentHTML += `<strong>目标片段：</strong> (长度 ${targetSeq.length})<br>`;
//     alignmentHTML += buildAlignedSequence(bestResult.alignment, 'target');
//     alignmentHTML += `<br><strong>最佳匹配区域 (${bestFrame.label}，起始位置 ${bestSubStart + 1})：</strong><br>`;
//     alignmentHTML += buildAlignedSequence(bestResult.alignment, 'query');
//     alignmentHTML += '</div>';

//     resultBox.innerHTML = `
//         <div class="result-summary">✅ 最佳匹配：${bestFrame.label}，片段匹配度 ${bestResult.percentage}%</div>
//         ${alignmentHTML}
//     `;
// }