import { highlightAA } from './dna-utils.js';
import { generateSixFrames } from './translator.js';

let lastSixFrameResults = [];

export function getLastResults() {
    return lastSixFrameResults;
}

export function updateStats(aaLength, dnaLength) {
    const statAmino = document.querySelector('.guide-stat-item:nth-child(2) .guide-stat-num');
    const statBase = document.querySelector('.guide-stat-item:nth-child(3) .guide-stat-num');
    if (statAmino) statAmino.textContent = aaLength;
    if (statBase) statBase.textContent = dnaLength;

    const statusRight = document.querySelector('.statusbar span:last-child');
    if (statusRight) statusRight.textContent = `✅ 6框翻译成功 · 总氨基酸数：${aaLength}`;
}

/**
 * 截取氨基酸序列前 N 个字符作为预览
 * @param {string} aaSeq - 完整氨基酸序列
 * @param {number} len - 预览长度
 * @returns {string}
 */
function getPreview(aaSeq, len = 25) {
    if (aaSeq.length <= len) return aaSeq;
    return aaSeq.slice(0, len) + '…';
}

/**
 * 为单个翻译框创建 DOM 行，带折叠/展开功能
 */
function createOrfRow(frame, idx) {
    const highlighted = highlightAA(frame.aaSequence);
    const previewText = getPreview(frame.aaSequence);

    const rowDiv = document.createElement('div');
    rowDiv.className = `orf-row ${frame.cssClass}`;
    rowDiv.dataset.frameIdx = idx;

    // 单选按钮
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'orfSelect';
    radio.value = idx;
    radio.className = 'orf-radio';

    // 折叠/展开按钮
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'orf-collapse-btn';
    collapseBtn.title = '点击折叠/展开';
    collapseBtn.innerHTML = '▼';
    collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSingleFrame(rowDiv, collapseBtn);
    });

    // 标签
    const labelSpan = document.createElement('span');
    labelSpan.className = 'orf-label';
    labelSpan.textContent = frame.label;
    // 点击标签也可以折叠/展开
    labelSpan.style.cursor = 'pointer';
    labelSpan.title = '点击折叠/展开';
    labelSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSingleFrame(rowDiv, collapseBtn);
    });

    // 折叠时的预览文本
    const previewSpan = document.createElement('span');
    previewSpan.className = 'orf-preview';
    previewSpan.textContent = previewText;

    // 序列包裹容器
    const seqWrap = document.createElement('span');
    seqWrap.className = 'orf-seq-wrap';

    const seqSpan = document.createElement('span');
    seqSpan.className = 'orf-seq';
    seqSpan.innerHTML = highlighted;
    seqWrap.appendChild(seqSpan);

    rowDiv.appendChild(radio);
    rowDiv.appendChild(collapseBtn);
    rowDiv.appendChild(labelSpan);
    rowDiv.appendChild(previewSpan);
    rowDiv.appendChild(seqWrap);

    return rowDiv;
}

/**
 * 切换单个翻译框的折叠状态
 */
function toggleSingleFrame(rowDiv, collapseBtn) {
    const isCollapsed = rowDiv.classList.toggle('collapsed');
    collapseBtn.innerHTML = isCollapsed ? '▶' : '▼';
    collapseBtn.title = isCollapsed ? '点击展开' : '点击折叠';
    rowDiv.querySelector('.orf-label').title = isCollapsed ? '点击展开' : '点击折叠';
}

/**
 * 切换全部翻译框的折叠状态
 */
function toggleAllFrames(container) {
    const rows = container.querySelectorAll('.orf-row');
    if (rows.length === 0) return;

    // 判断当前状态：如果存在展开的，则全部折叠；否则全部展开
    const hasExpanded = Array.from(rows).some(row => !row.classList.contains('collapsed'));
    const targetCollapsed = hasExpanded; // 如果存在展开的，就全部折叠

    rows.forEach(row => {
        if (targetCollapsed) {
            row.classList.add('collapsed');
        } else {
            row.classList.remove('collapsed');
        }
        const btn = row.querySelector('.orf-collapse-btn');
        if (btn) {
            btn.innerHTML = targetCollapsed ? '▶' : '▼';
            btn.title = targetCollapsed ? '点击展开' : '点击折叠';
        }
        const label = row.querySelector('.orf-label');
        if (label) {
            label.title = targetCollapsed ? '点击展开' : '点击折叠';
        }
    });

    // 更新全局按钮文字
    const toggleAllBtn = container.querySelector('.orf-toggle-all');
    if (toggleAllBtn) {
        toggleAllBtn.textContent = targetCollapsed ? '📂 全部展开' : '📁 全部折叠';
    }
}

export function renderSixFrame(rawInput) {
    const { dna, frames } = generateSixFrames(rawInput);
    lastSixFrameResults = frames;
    window.ORF = window.ORF || {};
    window.ORF.lastSixFrameResults = frames;

    const container = document.querySelector('.main-panel .card:last-child');
    if (!container) return;

    // 保存并重建 card 内容
    const titleDiv = container.querySelector('.card-title');
    container.innerHTML = '';
    if (titleDiv) {
        // 移除旧的全局折叠按钮（防止重复）
        const oldBtn = titleDiv.querySelector('.orf-toggle-all');
        if (oldBtn) oldBtn.remove();

        // 在标题上追加全局折叠按钮
        const toggleAllBtn = document.createElement('button');
        toggleAllBtn.className = 'orf-toggle-all';
        toggleAllBtn.textContent = '📁 全部折叠';
        toggleAllBtn.title = '折叠/展开全部翻译框';
        toggleAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAllFrames(container);
        });
        titleDiv.appendChild(toggleAllBtn);
        container.appendChild(titleDiv);
    }

    if (frames.length === 0) {
        updateStats(0, 0);
        return;
    }

    // 自动 / 手动选择行
    const selectRow = document.createElement('div');
    selectRow.className = 'orf-select-row';
    selectRow.innerHTML = `
        <label class="orf-radio-label">
            <input type="radio" name="orfSelect" value="" checked> 🔄 自动（扫描所有框）
        </label>
    `;
    container.appendChild(selectRow);

    // 创建六个翻译框行
    frames.forEach((frame, idx) => {
        const rowDiv = createOrfRow(frame, idx);
        container.appendChild(rowDiv);
    });

    updateStats(frames[0].aaSequence.length, dna.length);
}
