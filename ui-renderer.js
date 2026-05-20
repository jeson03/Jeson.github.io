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

export function renderSixFrame(rawInput) {
    const { dna, frames } = generateSixFrames(rawInput);
    lastSixFrameResults = frames;
    window.ORF = window.ORF || {};
    window.ORF.lastSixFrameResults = frames;

    const container = document.querySelector('.main-panel .card:last-child');
    if (!container) return;

    const titleDiv = container.querySelector('.card-title');
    container.innerHTML = '';
    if (titleDiv) container.appendChild(titleDiv);

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

    frames.forEach((frame, idx) => {
        const highlighted = highlightAA(frame.aaSequence);
        const rowDiv = document.createElement('div');
        rowDiv.className = `orf-row ${frame.cssClass}`;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'orfSelect';
        radio.value = idx;
        radio.className = 'orf-radio';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'orf-label';
        labelSpan.textContent = frame.label;

        const seqSpan = document.createElement('span');
        seqSpan.innerHTML = highlighted;

        rowDiv.appendChild(radio);
        rowDiv.appendChild(labelSpan);
        rowDiv.appendChild(seqSpan);
        container.appendChild(rowDiv);
    });

    updateStats(frames[0].aaSequence.length, dna.length);
}