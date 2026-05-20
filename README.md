<p align="center">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext y='.9em' font-size='52'%3E🧬%3C/text%3E%3C/svg%3E" width="80" alt="ORF Verifier Pro Logo"/>
</p>

<h1 align="center">ORF Verifier Pro</h1>

<p align="center">
  <strong>基因暗码解析终端</strong><br/>
  从 DNA 序列到蛋白质功能的全流程可视化验证工具
</p>

<p align="center">
  <a href="https://jeson03.top">
    <img src="https://img.shields.io/badge/在线演示-jeson03.top-blue?style=flat-square&logo=github" alt="在线演示"/>
  </a>
  <a href="https://github.com/jeson03/Jeson.github.io">
    <img src="https://img.shields.io/badge/GitHub-仓库-black?style=flat-square&logo=github" alt="GitHub 仓库"/>
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square&logo=open-source-initiative" alt="许可证"/>
  </a>
</p>

---

## 📖 简介

**ORF Verifier Pro** 是一个面向生物信息学学习者和研究人员的交互式 Web 工具，旨在解决基因组浏览软件（如 IGV）中蛋白质翻译结果难以验证的痛点。

它能够：
- 将任意 DNA 序列按 **六框翻译** 自动翻译为氨基酸序列，并高亮起始密码子（**M**）和终止密码子（**\***）
- 支持从本地 **.fa 参考基因组** 中按染色体坐标提取片段，也支持通过 **Ensembl REST API** 直接搜索基因名获取编码序列
- 提供 **IGV 比对模式**：粘贴在 IGV 中读出的氨基酸序列，工具自动扫描六个阅读框，寻找最佳匹配区域，并逐位高亮差异位点
- 内置 **示例库**（本地经典基因 + 在线下载）、**历史记录**、**复制/导出比对结果** 等实用功能

---

## 🌐 在线演示

你可以通过以下地址立即体验：

| 地址 | 说明 |
|:---|:---|
| **[https://jeson03.top](https://jeson03.top)** | 主站（自定义域名） |
| **[https://www.jeson03.top](https://www.jeson03.top)** | 备用域名 |
| **[https://jeson03.github.io](https://jeson03.github.io)** | GitHub Pages 源站 |

---

## 🚀 功能特性

### 核心分析
- **六框翻译引擎**：正链 3 框 + 反链 3 框同时翻译，自动标注起始密码子（**M**，绿色）和终止密码子（**\***，红色）
- **IGV 序列比对**：粘贴氨基酸序列，自动扫描六个框并输出最佳匹配区域，差异位点红色高亮
- **子串匹配**：支持局部片段比对，无需从第一个氨基酸开始对齐
- **手动选择阅读框**：可指定只比对一个特定阅读框，提升比对速度和精度

### 数据加载
- **本地 .fa 基因组**：上传参考基因组文件（`.fa`）和索引文件（`.fai`），按染色体坐标提取任意片段
- **基因名搜索**：通过 Ensembl REST API 输入基因名（如 `TP53`、`BRCA1`），自动获取最长蛋白质编码转录本的 CDS 序列
- **坐标提取**：直接输入 `chr17:7668421-7687490` 格式的坐标，精准提取序列

### 辅助功能
- **示例库**：内置经典基因（TP53, DUSP22-His, BRCA1, EGFR, ALK），同时支持在线下载更多基因
- **历史记录**：自动保存每次加载的序列，可一键回溯、重新加载或删除
- **复制 / 导出**：比对结果可复制为纯文本报告，或导出为 PNG 图片
- **实时统计**：翻译后即时显示碱基数、氨基酸总数
- **加载状态**：基因搜索和坐标提取时显示加载动画，防止重复点击

---

## 🧰 技术栈

| 分类 | 技术 |
|:---|:---|
| **前端架构** | 原生 JavaScript (ES6 Modules) |
| **样式方案** | CSS3（Glass morphism + 深色科技风 + 响应式布局） |
| **生物信息** | 自建标准密码子表、六框翻译算法、反向互补处理 |
| **外部 API** | [Ensembl REST API](https://rest.ensembl.org)（基因查询与序列获取） |
| **截图导出** | [html2canvas](https://html2canvas.hertzen.com/)（CDN 引入） |
| **数据持久化** | localStorage（历史记录管理） |
| **部署方案** | GitHub Pages + 自定义域名 `jeson03.top` + HTTPS |

---

## 🛠️ 本地运行

### 前提条件
- 任何现代浏览器（Chrome / Firefox / Edge / Safari）
- 本地静态服务器（VS Code 的 Live Server 插件，或 Node.js 的 `serve`）

### 运行步骤

```bash
# 1. 克隆仓库
git clone https://github.com/jeson03/Jeson.github.io.git

# 2. 进入项目目录
cd Jeson.github.io

# 3. 启动本地服务器（任选一种）

# 方法一：使用 Live Server（VS Code 插件，推荐）
# 在 VS Code 中打开文件夹，右键 index.html → "Open with Live Server"

# 方法二：使用 npx serve
npx serve .
浏览器访问 `http://localhost:5500`（Live Server）或 `http://localhost:3000`（serve）即可。

> ⚠️ 本项目使用 **ES6 模块**，必须通过 HTTP 服务器打开，不能直接双击 `index.html`。
```
---

## 📖 使用说明

### 基本操作

1. **输入序列**：在左侧文本框中粘贴 DNA 序列（仅含 ATCG），或使用坐标/基因名自动提取
2. **查看翻译**：六框翻译结果自动更新，M 为起始密码子（绿色），\* 为终止密码子（红色）
3. **上传基因组**：点击“📂 上传 .fa”，选择参考基因组文件（`.fa`）和索引文件（`.fai`）

### 高级功能

1. **坐标提取**：输入 `chr17:7668421-7687490` 格式，点击“🎯 提取序列”
2. **基因搜索**：输入基因名（如 `TP53`），点击“🔍 搜索基因”
3. **IGV 比对**：在右侧粘贴 IGV 中读出的氨基酸序列，点击“🔬 开始比对”
4. **手动选择框**：点击六框左侧的单选按钮，可指定只比对某一个阅读框
5. **导出结果**：比对完成后，点击“📋 复制结果”或“📸 导出截图”

---

## 📁 项目结构
.
├── index.html              # 主页面
├── style.css               # 全局样式（科技风主题）
├── app.js                  # 主入口，事件绑定与模块调度
├── codon-table.js          # 标准密码子表（DNA → 氨基酸）
├── dna-utils.js            # 序列清洗、反向互补、氨基酸高亮
├── translator.js           # 六框翻译引擎（正链3框 + 反链3框）
├── ui-renderer.js          # DOM 渲染、统计更新、手动选择阅读框
├── aligner.js              # IGV 比对模块（子串匹配 + 差异高亮）
├── fasta-loader.js         # .fa 文件加载与坐标提取
├── gene-fetcher.js         # Ensembl API 基因查询与 CDS 序列获取
├── api-examples.js         # 在线示例基因下载
├── history.js              # 历史记录管理（localStorage）
├── README.md               # 项目说明（本文件）
└── LICENSE                 # MIT 许可证

---

## 🗺️ 开发路线图

- [x] 六框翻译与可视化
- [x] IGV 比对（子串匹配 + 手动选择框）
- [x] 本地 .fa 基因组加载与坐标提取
- [x] Ensembl API 基因搜索
- [x] 示例库（本地 + 在线下载）
- [x] 历史记录（localStorage 持久化）
- [x] 复制 / 导出比对结果（文本 + PNG 图片）
- [x] 加载动画与状态反馈
- [x] GitHub Pages 部署 + 自定义域名 + HTTPS
- [ ] 响应式布局优化（移动端适配）
- [ ] Toast 通知替代原生 `alert`
- [ ] 键盘快捷键（`Ctrl+Enter` 比对等）
- [ ] 多转录本选择
- [ ] 集成 NCBI E-utilities

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果你想增加新功能或改进现有代码，请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交你的修改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开一个 Pull Request

---

## 📄 许可证

本项目基于 **MIT 许可证** 开源。详见 [LICENSE](./LICENSE) 文件。

---

## 💡 致谢

- 感谢 [Ensembl](https://www.ensembl.org) 提供开放的 REST API，让基因查询与序列获取变得简单
- 感谢 [html2canvas](https://html2canvas.hertzen.com/) 让浏览器端截图导出成为可能
- 感谢 [GitHub Pages](https://pages.github.com) 提供免费的静态网站托管服务

---

<p align="center">
  <sub>Made with 🧬 by <strong>Jeson</strong> · 2024</sub>
</p>
