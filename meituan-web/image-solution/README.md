# 美团图像解决方案实验

高级网页设计I · 24001010908 何良辰 · 班级 24009

本次在已有美团项目基础上完成自适应下导航，包含字体图标与 SVG 两种技术。原八个页面继续保留，900px 及以下增加 SVG 下导航。

## 运行

在项目根目录双击 `start-image-lab.bat`，自动打开 `http://localhost:8082/image-solution/index.html`。需要 Python 3，不需要安装 npm 包。关闭命令行窗口即可停止服务。

也可使用原来的 `start.bat`，再访问 `http://localhost:8080/image-solution/index.html`。请通过 HTTP 服务打开；直接双击 HTML 时，浏览器会限制跨文件 SVG 引用和主项目 JSON 请求。

## 本次文件

| 文件 | 内容 |
| --- | --- |
| index.html | 实验入口与两个版本链接 |
| font.html | 使用本地 WOFF/TTF 字体的下导航 |
| svg.html | 使用 SVG symbol/use 的下导航 |
| icons.html | 本次全部 5 个图标的对照展示 |
| lab.css | 两个版本共享的全局样式 |
| lab.js | 栏目、选中状态、技术版本切换 |
| assets/icons.svg | 5 个可复用 SVG symbol |
| assets/hlc-icons.woff、hlc-icons.ttf | 同一套图形生成的字体 |
| assets/sources.json | iconfont 来源、图标 ID、原始素材哈希 |
| assets/product-data.js | 从原项目 JSON 导出的演示商品数据 |
| screenshots/ | 两个浏览器、四个宽度下的实际测试截图 |
| qa-results.json | 实际自动化验收记录 |
| report/24001010908-何良辰.docx | 按学校模板填写的图像解决方案报告 |

已有八个网页统一增加 `css/hlc-bottom-nav.css` 与 `js/hlc-bottom-nav.js`。手机端五个入口分别到首页、美食、周边游、订单、个人中心。原布局使用的 he_ 前缀保留，新增实验样式、符号 ID 与页面脚本使用 hlc_ 前缀。

## 图标与技术

使用原项目已有的 iconfont 天猫好房官方图标库（cid=42993）素材，选择首页、美食、发现、订单、我的 5 个图标。保留原始 SVG 文件；字体由原路径在本地转换，字符范围 U+E901–U+E905，字体转换中的三次曲线转换为二次曲线。SVG symbol 去除固定 fill，由 `fill: currentColor` 控制颜色。没有生成新的摄影图片，也没有引入在线图标依赖。

固定导航用 `position: fixed`，五个入口通过 `flex: 1` 等分宽度，正文和浮动按钮为下导航预留空间。支持手机安全区、键盘焦点、当前项提示及普通链接导航。

## 验证与报告

2026-10-27 在 Chromium 和 Microsoft Edge 中分别测试 320、390、768、1440px 宽度，覆盖字体图标和 SVG 两种版本，共 16 组组合；另检查原八页接入、桌面隐藏、键盘访问及非法栏目参数回退。结果和版本号以 qa-results.json 为准。未测试 Firefox 和 Safari。

报告中的“原图”是本人的原有美团项目顶部主导航，符合无下导航时可以使用其他导航的实验选项；不标为官方 APP 截图。报告含本次真实测试截图与 AI 辅助使用说明。服务器公网发布截图是实验可选项，本次仅本地运行，没有新增公网发布或远程推送。

之前的网页元素设计报告继续保留在项目原 report 目录中，与本次图像解决方案报告分别存放。
