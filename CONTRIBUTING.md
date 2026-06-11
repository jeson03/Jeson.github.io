# 贡献指南

感谢你对 ORF Verifier Pro 的关注！

## 开发环境搭建

```bash
git clone https://github.com/jeson03/Jeson.github.io.git
cd Jeson.github.io
npm install
npm run dev        # 启动开发服务器 (http://localhost:3000)
```

## 项目结构

```
├── index.html                # 入口 HTML
├── src/
│   ├── app.js                # 主控制器，事件绑定
│   ├── style.css             # 全局样式
│   ├── core/                 # 纯业务逻辑（无 DOM 依赖）
│   │   ├── codon-table.js    # 标准密码子表
│   │   ├── dna-utils.js      # 序列清洗、反向互补
│   │   ├── translator.js     # 六框翻译引擎
│   │   └── aligner.js        # 序列比对算法
│   ├── services/             # 外部集成
│   │   ├── fasta-loader.js   # FASTA 文件解析
│   │   ├── gene-fetcher.js   # Ensembl API（本地基因组模式）
│   │   ├── api-examples.js   # Ensembl API（在线下载模式）
│   │   └── history.js        # localStorage 历史记录
│   └── ui/                   # 渲染与交互
│       ├── ui-renderer.js    # 六框翻译 DOM 渲染
│       └── toast.js          # Toast 通知系统
├── tests/                    # 单元测试（Vitest）
│   ├── codon-table.test.js
│   ├── dna-utils.test.js
│   ├── translator.test.js
│   └── aligner.test.js
├── .github/workflows/ci.yml  # CI 流水线
├── package.json
└── vite.config.js
```

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（HMR） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm test` | 运行单元测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:coverage` | 生成覆盖率报告 |
| `npm run lint` | ESLint 代码检查 |
| `npm run lint:fix` | 自动修复 lint 问题 |
| `npm run format` | Prettier 格式化代码 |
| `npm run format:check` | 检查格式 |

## 代码规范

- **分层原则**：`src/core/` 中的模块不得引用 DOM，保持纯函数。UI 逻辑放在 `src/ui/`，外部 API 调用放在 `src/services/`。
- **禁止 `alert()`**：使用 `toast.success()` / `toast.error()` / `toast.warning()` / `toast.info()` 替代。
- **`confirm()` 例外**：仅用于不可逆的破坏性操作（如清空历史记录）。
- **ESLint 规则**：遵循 `.eslintrc.json` 中的配置，`no-alert` 为 error 级别。
- **测试要求**：新增 `src/core/` 中的纯函数必须有对应的单元测试。

## 提交规范

使用语义化提交信息：

```
feat: 新功能
fix: 修复 bug
refactor: 重构（不改变功能）
test: 添加/修改测试
docs: 文档变更
chore: 构建/工具变更
style: 代码格式（不影响逻辑）
```

示例：
```
feat: add collapse/expand toggle for six-frame translation
fix: Ensembl API strand parameter ignored for reverse-strand genes
refactor: remove commented-out duplicate code in aligner.js
```

## Pull Request 流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/my-feature`
3. 确保测试通过：`npm test`
4. 确保格式正确：`npm run format:check && npm run lint`
5. 提交并推送
6. 创建 Pull Request 到 `main` 分支
