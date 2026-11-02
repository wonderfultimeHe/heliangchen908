# heliangchen908 — 何良辰的《高级网页设计》课堂实践

> 姓名：何良辰 · 学号：908
> 课程：《高级网页设计》

## 在线访问

项目已通过 GitHub Pages 发布，直接打开：

**https://wonderfultimehe.github.io/heliangchen908/**

从首页（课堂目录）可以点击进入每一个课堂作品。

## 项目内容

| 模块 | 文件 | 说明 |
|---|---|---|
| 课堂目录首页 | `index.html` | 全部作品的总入口 |
| HTML 基础 | `01.html` | 标题、段落、链接、图片、列表、表格与表单 |
| 自我介绍网页 | `self-introduction.html` | 个人主页 |
| 层叠与继承 + 盒模型 | `stack004.html` | CSS 层叠、继承与盒模型练习 |
| CSS3 选择器与动画 | `html004.html` | 选择器与 `animation` 练习 |
| 图文排版 | `picture_above_text.html` | 图下文字与图上文字两种效果 |
| 网页布局 | `layout908.html` | 经典页面骨架与固定定位广告 |
| SVG 图标 | `svg.html` | iconfont symbol 引用 SVG 图标 |
| JS 数据类型 | `datataye004.html` | 运算符、类型转换与"逢 7 过"网格 |
| JS 内置对象 | `JS_obj_fun.html` | `Math`、`Date` 与数组方法 |
| Font Awesome 字体图标 | `iconfont-1.html` | 字体图标实验（本地资源） |
| Lucide 矢量图标 | `iconfont-2.html` | SVG 图标实验（本地资源） |
| Tab 选项卡组件 | `tabs.html` + `js/tabs.js` | 可复用选项卡组件，事件监听驱动 |
| 课堂测试 · 新闻选项卡 | `test9-tab.html` | 最新投诉 / 官方回应 / 追踪调查 |
| 美团图像解决方案 | `meituan-web/image-solution/` | 字体图标与 SVG 自适应底部导航实验 |
| 美团仿站应用 | `meituan-web/` | 八个页面的完整应用 |

## 目录结构

```
heliangchen908/
├── index.html              # 课堂目录（首页）
├── *.html / *.css          # 各课堂练习页面与样式
├── js/                     # 可复用脚本（tabs.js）
├── img/                    # 图片资源
├── font/                   # iconfont 字体资源
├── cdn/                    # 本地化的图标库（Font Awesome / Lucide）
└── meituan-web/            # 美团仿站应用与图像解决方案实验
```

## 本地运行

所有页面均为原生 HTML / CSS / JavaScript，无需构建。直接用浏览器打开 `index.html` 即可浏览；美团应用涉及 `fetch` 本地 JSON，建议用本地服务打开：

```bash
cd meituan-web
python -m http.server 8080
```

## 发布方式

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages（见 `.github/workflows/pages.yml`）。
GitHub Pages 用于展示本课程网页。
