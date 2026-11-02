/**
 * tabs.js —— 可复用的 Tab 选项卡组件
 *
 * 用法：
 *   1. HTML 按以下结构书写（一个页面可以放任意多组）：
 *      <div class="hlc_tabs">
 *          <div class="hlc_tab_bar">
 *              <button class="hlc_tab_btn" data-hlc-tab="#面板id">选项名</button>
 *          </div>
 *          <div class="hlc_tab_panel" id="面板id">面板内容</div>
 *      </div>
 *   2. 默认选中的按钮和面板，直接在 HTML 里加 hlc_active 类。
 *   3. 页面底部调用：hlc_init_tabs('.hlc_tabs');
 */

/**
 * 初始化选项卡
 * @param {string} hlc_selector - Tab 组容器的选择器
 */
function hlc_init_tabs(hlc_selector) {
    var hlc_groups = document.querySelectorAll(hlc_selector);

    for (var hlc_i = 0; hlc_i < hlc_groups.length; hlc_i++) {
        hlc_bind_tab_group(hlc_groups[hlc_i]);
    }
}

/**
 * 给一组选项卡绑定事件监听
 * @param {Element} hlc_group - Tab 组容器（.hlc_tabs）
 */
function hlc_bind_tab_group(hlc_group) {
    var hlc_btns = hlc_group.querySelectorAll('.hlc_tab_btn');

    for (var hlc_i = 0; hlc_i < hlc_btns.length; hlc_i++) {
        // 事件监听：点击任一选项卡按钮
        hlc_btns[hlc_i].addEventListener('click', function () {
            hlc_select_tab(hlc_group, this);
        });
    }
}

/**
 * 切换选中状态
 * @param {Element} hlc_group        - Tab 组容器
 * @param {Element} hlc_current_btn  - 当前被点击的按钮
 */
function hlc_select_tab(hlc_group, hlc_current_btn) {
    // 第一步：清除所有选项卡的选中状态
    var hlc_btns = hlc_group.querySelectorAll('.hlc_tab_btn');
    for (var hlc_i = 0; hlc_i < hlc_btns.length; hlc_i++) {
        hlc_btns[hlc_i].classList.remove('hlc_active');
    }

    // 同时隐藏所有面板
    var hlc_panels = hlc_group.querySelectorAll('.hlc_tab_panel');
    for (var hlc_j = 0; hlc_j < hlc_panels.length; hlc_j++) {
        hlc_panels[hlc_j].classList.remove('hlc_active');
    }

    // 第二步：设置当前元素的选中状态
    hlc_current_btn.classList.add('hlc_active');

    // 找到 data-hlc-tab 指向的面板并显示
    var hlc_panel = hlc_group.querySelector(hlc_current_btn.getAttribute('data-hlc-tab'));
    if (hlc_panel) {
        hlc_panel.classList.add('hlc_active');
    }
}
