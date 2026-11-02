# 美团网页版课程项目

《高级网页设计I》 · 24001010908 何良辰

以美团经典生活服务网页版为参考的本地课程项目。使用黄色搜索栏、左侧分类导航、轮播推荐、商品卡片、列表与个人中心等布局。共 8 个独立页面，前端仅使用原生 HTML、CSS、JavaScript；没有 Bootstrap、jQuery、Vue、React、Tailwind 或第三方前端库，不使用表格布局和 float 布局。

## 启动

本次“图像解决方案”实验已补全：双击 `start-image-lab.bat` 打开独立实验入口，包含字体图标版、SVG 版、图标展示、真实测试截图和按学校模板填写的报告。详情见 [实验说明](image-solution/README.md)。原有八个页面新增手机端 SVG 下导航，新增代码使用 `hlc_` 前缀。

1. 电脑安装 Python 3。本机已具备 Python。
2. 双击项目中的 `start.bat`，本地服务启动后会打开浏览器。
3. 访问 **http://localhost:8080**。
4. 关闭服务时，在服务窗口按 `Ctrl+C`。

也可在项目目录运行：

```powershell
python server.py --open
```

端口被占用时：

```powershell
python server.py --port 8081 --open
```

不要直接双击 HTML：浏览器的 `file://` 限制会阻止 `fetch` 读取 JSON。可以改用 VS Code Live Server 或任意静态 HTTP 服务。不需要 npm 安装，不需要构建，运行网站时无需联网。

## 页面

| 文件                 | 页面层级与内容                                         |
| -------------------- | ------------------------------------------------------ |
| `index.html`         | 一级首页：分类导航、轮播、有格调、推荐民宿、猜你喜欢   |
| `food.html`          | 二级美食栏目：关键词、分类、区域、价格筛选，排序和分页 |
| `detail.html?id=f01` | 三级详情：商家介绍、套餐、须知、评价、收藏和预订       |
| `hotels.html`        | 酒店栏目：区域、入住/离店日期、人数与酒店排序          |
| `travel.html`        | 周边游栏目：海滨、自然、城市、亲子分类                 |
| `profile.html`       | 我的：订单统计、收藏列表、个人资料设置                 |
| `orders.html`        | 我的订单：状态筛选、搜索、取消、模拟使用               |
| `admin.html`         | 后台管理：商品增删改、上下架、数据概览                 |

详情页兼容美食、酒店和出游商品，例如 `detail.html?id=h01`、`detail.html?id=t01`。所有页面标题包含完整学号和姓名。

## 目录

```text
meituan-web/
  index.html             首页
  food.html              美食列表
  detail.html            商品详情
  hotels.html            酒店住宿
  travel.html            周边游
  profile.html           个人中心
  orders.html            订单中心
  admin.html             商家后台
  css/style.css          公共样式、页面布局、响应式规则
  js/app.js              全部原生交互及数据读取
  image/                 17 张网络照片、19 个 iconfont SVG
    sources.json         每个素材的来源、图标 ID 和 SHA256
  data/                  7 份本地 JSON Mock 数据
  docs/                  要求对照、测试记录、实现截图
  tools/                 素材下载、初始页面生成、浏览器验收脚本
  server.py              Python 标准库本地静态服务
  start.bat              Windows 启动入口
  .git/                  真实分阶段本地提交历史
```

源代码目录和文件名使用英文。页面布局类统一使用姓名拼音姓氏前缀 `he_`，变量、函数使用有意义的名字；`id` 只用于锚点与无障碍关联，不用 ID 选择器布局。

## 数据与交互

页面统一通过 `he_fetch()` 调用 `fetch('data/xxx.json')`。基础数据为本地 Mock，修改与订单写入当前浏览器的 `localStorage`；没有远程数据库和真实账号系统。

| 请求接口                 | 内容           | 使用位置               |
| ------------------------ | -------------- | ---------------------- |
| `GET /data/banners.json` | 3 个轮播推荐   | 首页                   |
| `GET /data/shops.json`   | 12 个美食商品  | 首页、美食、详情、后台 |
| `GET /data/hotels.json`  | 4 个酒店商品   | 首页、酒店、详情、后台 |
| `GET /data/travel.json`  | 4 个周边游商品 | 周边游、详情、后台     |
| `GET /data/reviews.json` | 3 条演示评价   | 详情页                 |
| `GET /data/user.json`    | 初始个人资料   | 我的                   |
| `GET /data/orders.json`  | 初始空订单列表 | 我的、订单、后台       |

商品主字段：`id`、`name`、`type`、`category`、`area`、`price`、`originalPrice`、`rating`、`sales`、`image`、`package`、`active`。订单保存商品快照，后台后续改价或删除商品不会改变已生成订单的名称和金额。

实现的有效交互超过 6 个：

- 轮播自动播放、手动切换、暂停；悬停和键盘聚焦时暂停。
- 首页推荐标签切换、关键词搜索。
- 美食分类/区域/价格组合筛选、排序、分页和空结果反馈。
- 城市偏好切换和保存。商品仍使用大连演示数据，界面会明确提示。
- 收藏/取消收藏，个人中心同步显示。
- 详情页标签页、键盘切换、评价有图筛选。
- 数量增减、金额实时计算、确认弹窗与演示订单生成。
- 酒店日期校验、按区域筛选、排序，按入住晚数计算金额。
- 周边游分类切换。
- 个人资料校验与持久化。
- 订单筛选、搜索、确认取消、模拟使用。
- 后台新增/编辑/删除商品及上下架，前台重新进入或刷新后同步。
- 返回顶部、消息提示、加载失败提示。

本项目不接入支付、不收集密码、不执行真实交易。不同浏览器、不同端口的本地状态相互独立。清除网站存储即可恢复初始演示状态；`data/` 中的原始 JSON 不会被后台编辑覆盖。后台属于教学演示，没有生产环境权限控制。

## 图片与图标

所有页面摄影图片下载自 Unsplash，存于 `image/`。没有 AI 生成图片，没有把带文字的页面截图当作网页内容。

19 个 SVG 图标通过 **iconfont.cn 官方公开图标库接口**下载，来源为[天猫好房官方图标库](https://www.iconfont.cn/collections/detail?cid=42993)，保留原始 SVG 路径。完整来源清单见 `image/sources.json`。照片仅作课程配图，不表示演示商家的实拍；商业再使用前应独立确认素材授权。

网站的图片、图标、CSS、JS、JSON 均为相对本地路径。浏览器验收会检查是否存在外部运行请求。

## 实验报告与提交

原网页元素实验材料位于 `docs/`，本次图像解决方案的完整报告位于 `image-solution/report/24001010908-何良辰.docx`，报告附有实际运行截图、核心代码及 AI 辅助说明。`docs/screenshots/` 和 `image-solution/screenshots/` 都是测试截图，不作为网页素材，也不是原站截图。

本地仓库已有实际开发过程的 Git 提交。**尚未创建或推送 GitHub/Gitee 远程仓库，也未公网部署**。期末要求的 Public 仓库或评审访问权限，需要后续在自己的账户中完成；本地运行截图不能代替公网发布截图。

建议提交时按课程要求将源码压缩包命名为 `24001010908-何良辰.zip`。提交前请复核报告信息与个人理解。图像解决方案实验允许无下导航时用其他导航作原图，本次据此采用原项目的主导航，并补充两种技术的下导航。

## 验证与维护

浏览器验收记录见 `docs/qa-results.json`，截图见 `docs/screenshots/`。网站本身不依赖测试工具；`tools/qa.cjs` 需要单独的 Playwright 开发环境，属于测试工具，不会被页面引用。

```powershell
# JS 语法检查
node --check js/app.js
# 可选：已有 Playwright 的开发环境执行浏览器验收
node tools/qa.cjs
# 查看真实开发提交
git log --oneline
```

`tools/download_assets.py` 是素材获取记录，重新下载需要 Python requests 和网络；已有素材无需重下。`tools/build_pages.py` 是初始页面/Mock 生成器，重新运行会覆盖页面和初始数据，日常编辑直接修改 HTML/CSS/JS 即可。
