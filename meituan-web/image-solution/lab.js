// 24001010908 何良辰：字体图标与 SVG 页面使用相同内容与状态逻辑。
(() => {
  const hlc_nav = document.querySelector(".hlc_bottom_nav");
  if (!hlc_nav) return;
  const hlc_states = {
    home: [
      "今天，也要好好吃饭。",
      "附近好店与城市灵感，一起发现。",
      "为你发现",
      ["food-hotpot", "food-cafe", "hotel-room", "travel-coast"],
    ],
    food: [
      "下一顿，吃点喜欢的。",
      "火锅、咖啡与甜点，给生活加点味道。",
      "附近人气美食",
      ["food-hotpot", "food-cafe", "food-noodles", "food-dessert"],
    ],
    travel: [
      "周末，去看看风景。",
      "从海边到山间，换一种方式度过今天。",
      "周边游与好住处",
      ["travel-coast", "travel-mountain", "hotel-room", "hotel-resort"],
    ],
    order: [
      "每一次期待，都在这里。",
      "回到订单中心，查看已有项目中的演示订单。",
      "你可能还喜欢",
      ["food-noodles", "food-dessert", "hotel-room", "travel-coast"],
    ],
    user: [
      "你好，何同学。",
      "收藏喜欢的小店，让美好生活有迹可循。",
      "值得收藏的日常",
      ["food-cafe", "food-hotpot", "travel-coast", "hotel-room"],
    ],
  };
  const hlc_products = window.hlc_products;
  const hlc_requested = new URLSearchParams(location.search).get("tab");
  const hlc_tab = Object.hasOwn(hlc_states, hlc_requested)
    ? hlc_requested
    : "home";
  const hlc_state = hlc_states[hlc_tab];
  hlc_nav
    .querySelector(`[data-hlc-tab="${hlc_tab}"]`)
    .setAttribute("aria-current", "page");
  document.querySelector("[data-hlc-title]").textContent = hlc_state[0];
  document.querySelector("[data-hlc-description]").textContent = hlc_state[1];
  document.querySelector("[data-hlc-heading]").textContent = hlc_state[2];
  document.querySelector(".hlc_tech a").href += `?tab=${hlc_tab}`;
  const hlc_target = {
    order: ["../orders.html", "查看我的订单"],
    user: ["../profile.html", "打开个人中心"],
    travel: ["../travel.html", "去发现周边风景"],
  }[hlc_tab];
  if (hlc_target) {
    document.querySelector(".hlc_hero a").href = hlc_target[0];
    document.querySelector(".hlc_hero a").textContent = `${hlc_target[1]} ↗`;
  }
  // 商品名称、价格、评分与详情链接沿用已有课程项目的演示数据。
  document.querySelector("[data-hlc-cards]").innerHTML = hlc_state[3]
    .map((hlc_image) => {
      const [hlc_name, hlc_area, hlc_price, hlc_id, hlc_rating] =
        hlc_products[hlc_image];
      return `<a class="hlc_card" href="../detail.html?id=${hlc_id}"><img src="../image/${hlc_image}.jpg" alt="${hlc_name}"><div><h3>${hlc_name}</h3><p class="hlc_rating">★ ${hlc_rating}　精选推荐</p><p>${hlc_area}</p><span class="hlc_price"><small>¥</small>${hlc_price}<small> 起</small></span></div></a>`;
    })
    .join("");
})();
