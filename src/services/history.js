// 历史记录管理模块

const STORAGE_KEY = 'orf_verifier_history';
const MAX_ITEMS = 50;

/**
 * 获取所有历史记录
 * @returns {Array<{ id, timestamp, source, dnaLength, aaLength, sequence }>}
 */
export function getHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

/**
 * 保存一条历史记录
 * @param {string} source - 来源描述（如 '示例 TP53'、'坐标提取 chr17:...'）
 * @param {string} sequence - DNA 序列
 * @param {number} aaLength - 翻译后氨基酸长度（可选）
 */
export function saveHistory(source, sequence, aaLength = 0) {
    const history = getHistory();
    history.unshift({
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        source,
        dnaLength: sequence.length,
        aaLength,
        sequence, // 保存完整序列，便于回溯
    });
    // 超过最大数量则截断
    if (history.length > MAX_ITEMS) {
        history.splice(MAX_ITEMS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * 删除指定 id 的历史记录
 * @param {number} id
 */
export function deleteHistory(id) {
    const history = getHistory().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * 清空全部历史记录
 */
export function clearHistory() {
    localStorage.setItem(STORAGE_KEY, '[]');
}
