// 24001010908 何良辰：美团图像解决方案，SVG 自适应下导航。
(() => {
  const hlc_items = [
    ["home", "首页", "index.html", "e901"],
    ["food", "美食", "food.html", "e902"],
    ["travel", "发现", "travel.html", "e903"],
    ["order", "订单", "orders.html", "e904"],
    ["user", "我的", "profile.html", "e905"],
  ];
  const hlc_file = location.pathname.split("/").pop() || "index.html";
  const hlc_current = {
    "index.html": "home",
    "food.html": "food",
    "detail.html": "food",
    "hotels.html": "travel",
    "travel.html": "travel",
    "orders.html": "order",
    "profile.html": "user",
    "admin.html": "user",
  }[hlc_file];
  const hlc_nav = document.createElement("nav");
  hlc_nav.className = "hlc_project_nav";
  hlc_nav.setAttribute("aria-label", "美团底部导航");
  hlc_nav.innerHTML = hlc_items
    .map(
      ([hlc_key, hlc_label, hlc_target]) =>
        `<a class="hlc_project_nav_item" href="${hlc_target}" ${hlc_key === hlc_current ? 'aria-current="page"' : ""}><svg aria-hidden="true"><use href="image-solution/assets/icons.svg#hlc_icon_${hlc_key}"></use></svg><span>${hlc_label}</span></a>`,
    )
    .join("");
  document.body.append(hlc_nav);
})();
