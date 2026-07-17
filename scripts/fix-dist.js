const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// 1. 修复 dist/comp.json 的自引用
const compJsonPath = path.join(distDir, 'comp.json');
if (fs.existsSync(compJsonPath)) {
  const content = JSON.parse(fs.readFileSync(compJsonPath, 'utf8'));
  if (content.usingComponents && content.usingComponents.comp === './comp') {
    delete content.usingComponents;
    fs.writeFileSync(compJsonPath, JSON.stringify(content));
    console.log('✅ 已修复 dist/comp.json 自引用');
  }
}

// 2. 清空所有页面 JSON 中的 usingComponents（当前使用默认 tabBar，不需要 comp）
const pagesDir = path.join(distDir, 'pages');
if (fs.existsSync(pagesDir)) {
  const entries = fs.readdirSync(pagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const jsonPath = path.join(pagesDir, entry.name, 'index.json');
      if (fs.existsSync(jsonPath)) {
        const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (content.usingComponents) {
          delete content.usingComponents;
          fs.writeFileSync(jsonPath, JSON.stringify(content));
          console.log(`✅ 已清理 pages/${entry.name}/index.json`);
        }
      }
    }
  }
}

console.log('🎉 dist 修复完成');
