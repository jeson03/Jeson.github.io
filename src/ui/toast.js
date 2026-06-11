/**
 * Toast 通知系统 — 替代原生 alert()，提供非阻塞的用户反馈。
 *
 * 用法：
 *   import { toast } from './toast.js';
 *   toast.success('操作成功');
 *   toast.error('操作失败');
 *   toast.warning('请注意');
 *   toast.info('提示信息');
 */

const CONTAINER_ID = 'toast-container';
const TOAST_DURATION = 3500; // ms

/** @type {'success'|'error'|'warning'|'info'} */
let _idCounter = 0;

const ICONS = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

const COLORS = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
    info: '#2563eb',
};

function ensureContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        Object.assign(container.style, {
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
        });
        document.body.appendChild(container);
    }
    return container;
}

/**
 * 创建并显示一个 toast
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 */
function createToast(message, type) {
    const container = ensureContainer();
    const id = `toast-${++_idCounter}`;

    const el = document.createElement('div');
    el.id = id;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');

    Object.assign(el.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        borderRadius: '10px',
        background: `rgba(16, 24, 32, 0.95)`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${COLORS[type]}33`,
        color: '#e0e8f0',
        fontSize: '0.88em',
        fontWeight: '500',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${COLORS[type]}22`,
        pointerEvents: 'auto',
        opacity: '0',
        transform: 'translateX(40px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        maxWidth: '420px',
        wordBreak: 'break-word',
    });

    el.innerHTML = `
        <span style="font-size:1.2em;flex-shrink:0;">${ICONS[type]}</span>
        <span style="flex:1;">${message}</span>
        <button
            style="
                background:none;border:none;color:#8899aa;cursor:pointer;
                font-size:1.1em;padding:0 4px;flex-shrink:0;line-height:1;
            "
            aria-label="关闭通知"
        >✕</button>
    `;

    container.appendChild(el);

    // 触发入场动画
    requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
    });

    // 关闭按钮
    const closeBtn = el.querySelector('button');
    closeBtn.addEventListener('click', () => dismissToast(el));

    // 自动消失
    const timer = setTimeout(() => dismissToast(el), TOAST_DURATION);
    el._dismissTimer = timer;

    // 鼠标悬停时暂停自动消失
    el.addEventListener('mouseenter', () => clearTimeout(el._dismissTimer));
    el.addEventListener('mouseleave', () => {
        el._dismissTimer = setTimeout(() => dismissToast(el), TOAST_DURATION);
    });
}

function dismissToast(el) {
    if (el._dismissed) return;
    el._dismissed = true;
    clearTimeout(el._dismissTimer);
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
}

export const toast = {
    /** 成功提示 */
    success(msg) {
        createToast(msg, 'success');
    },
    /** 错误提示 */
    error(msg) {
        createToast(msg, 'error');
    },
    /** 警告提示 */
    warning(msg) {
        createToast(msg, 'warning');
    },
    /** 信息提示 */
    info(msg) {
        createToast(msg, 'info');
    },
};
