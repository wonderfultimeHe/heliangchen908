/* 何良辰 24001010908 · 原生 JavaScript：fetch 本地 Mock + localStorage 演示状态 */
"use strict";
(() => {
  const he_page = document.body.dataset.page;
  const he_params = new URLSearchParams(location.search);
  const he_prefix = "he_meituan_v1_";
  const he_cache = new Map();
  const he_q = (selector, root = document) => root.querySelector(selector);
  const he_qa = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const he_escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const he_money = (value) =>
    Number(value)
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1");
  let he_toastTimer;
  function he_read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(he_prefix + key)) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function he_write(key, value) {
    try {
      localStorage.setItem(he_prefix + key, JSON.stringify(value));
      return true;
    } catch {
      he_toast("浏览器未能保存数据，请检查存储空间或隐私设置。");
      return false;
    }
  }
  function he_toast(message) {
    const node = he_q(".he_toast");
    node.textContent = message;
    node.hidden = false;
    clearTimeout(he_toastTimer);
    he_toastTimer = setTimeout(() => {
      node.hidden = true;
    }, 3200);
  }
  async function he_fetch(name) {
    if (!he_cache.has(name)) {
      he_cache.set(
        name,
        fetch(`data/${name}.json`).then((response) => {
          if (!response.ok)
            throw new Error(`${name} 数据加载失败（${response.status}）`);
          return response.json();
        }),
      );
    }
    return he_cache.get(name);
  }
  async function he_products(includeInactive = false) {
    const groups = await Promise.all(
      ["shops", "hotels", "travel"].map(he_fetch),
    );
    const changes = he_read("products", {});
    const deleted = he_read("deleted", []);
    const all = [...groups.flat(), ...he_read("added", [])].map((item) => ({
      ...item,
      ...(changes[item.id] || {}),
    }));
    return all.filter(
      (item) => !deleted.includes(item.id) && (includeInactive || item.active),
    );
  }
  async function he_orders() {
    return he_read("orders", null) ?? (await he_fetch("orders"));
  }
  const he_favorites = () => he_read("favorites", []);
  function he_empty(title, text, link = "food.html", label = "去发现好店") {
    return `<div class="he_empty"><img src="image/icon-shop.svg" alt=""><h3>${he_escape(title)}</h3><p>${he_escape(text)}</p>${link ? `<a href="${link}" class="he_button">${label}</a>` : ""}</div>`;
  }
  function he_star(rating) {
    return `<span class="he_rating">★★★★★ ${Number(rating).toFixed(1)}分</span>`;
  }
  function he_card(item, extra = "") {
    const selected = he_favorites().includes(item.id);
    return `<article class="he_card"><button class="he_card_favorite ${selected ? "he_selected" : ""}" data-favorite="${item.id}" aria-label="${selected ? "取消收藏" : "收藏"}${he_escape(item.name)}" aria-pressed="${selected}"><img src="image/icon-heart.svg" alt=""></button><a href="detail.html?id=${encodeURIComponent(item.id)}${extra}"><img class="he_card_image" src="${he_escape(item.image)}" alt="${he_escape(item.name)}配图" loading="lazy"><h3>${he_escape(item.name)}</h3><p class="he_card_desc">${he_escape(item.package)}</p><div class="he_card_meta">${he_star(item.rating)}<span>${he_escape(item.area)}</span></div><div class="he_price_line"><span class="he_price"><small>¥</small>${he_money(item.price)}</span><del>¥${he_money(item.originalPrice)}</del><span>${item.type === "hotel" ? "起 / 晚" : `已售 ${item.sales}`}</span></div></a></article>`;
  }
  function he_active(container, attr, value) {
    he_qa(`[${attr}]`, container).forEach((button) => {
      const selected = button.getAttribute(attr) === value;
      button.classList.toggle("he_active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }
  function he_modal(title, body, actions = "") {
    const dialog = he_q("[data-dialog]");
    dialog.innerHTML = `<div class="he_dialog_header"><h2>${he_escape(title)}</h2><button data-dialog-close aria-label="关闭弹窗">×</button></div>${body}${actions ? `<div class="he_dialog_actions">${actions}</div>` : ""}`;
    dialog.showModal();
    he_q("[data-dialog-close]", dialog).onclick = () => dialog.close();
    he_qa("[data-cancel]", dialog).forEach((button) => {
      button.onclick = () => dialog.close();
    });
    return dialog;
  }
  function he_confirm(title, message, callback) {
    const dialog = he_modal(
      title,
      `<p>${he_escape(message)}</p>`,
      '<button class="he_button he_button_outline" data-cancel>再想想</button><button class="he_button" data-confirm>确认</button>',
    );
    he_q("[data-confirm]", dialog).onclick = async (event) => {
      event.currentTarget.disabled = true;
      await callback();
      dialog.close();
    };
  }
  function he_common() {
    he_qa("[data-nav]").forEach((link) => {
      if (
        link.dataset.nav === he_page ||
        (he_page === "detail" && link.dataset.nav === "food")
      ) {
        link.classList.add("he_active");
        link.setAttribute("aria-current", "page");
      }
    });
    he_q("[data-current-city]").textContent = he_read("city", "大连");
    he_q("[data-city-open]").onclick = () => {
      const box = he_q("[data-city-popover]");
      box.hidden = !box.hidden;
    };
    he_qa("[data-city]").forEach((button) => {
      button.onclick = () => {
        if (!he_write("city", button.dataset.city)) return;
        he_q("[data-current-city]").textContent = button.dataset.city;
        he_q("[data-city-popover]").hidden = true;
        he_toast(
          button.dataset.city === "大连"
            ? "已切换到大连"
            : `已切换城市偏好为${button.dataset.city}，课程商品仍为大连演示数据`,
        );
      };
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".he_city_control"))
        he_q("[data-city-popover]").hidden = true;
      const favorite = event.target.closest("[data-favorite]");
      if (!favorite) return;
      const list = he_favorites(),
        id = favorite.dataset.favorite,
        selected = !list.includes(id);
      if (
        !he_write(
          "favorites",
          selected ? [...list, id] : list.filter((value) => value !== id),
        )
      )
        return;
      he_qa("[data-favorite]")
        .filter((button) => button.dataset.favorite === id)
        .forEach((button) => {
          button.classList.toggle("he_selected", selected);
          button.setAttribute("aria-pressed", String(selected));
          button.setAttribute("aria-label", selected ? "取消收藏" : "收藏商家");
          if (button.dataset.favoriteLabel !== undefined)
            button.innerHTML = `<img src="image/icon-heart.svg" alt="" width="16" height="16"> ${selected ? "已收藏" : "收藏商家"}`;
        });
      he_toast(selected ? "已加入我的收藏" : "已取消收藏");
      if (he_page === "profile") he_renderFavorites();
    });
    const backtop = he_q("[data-backtop]");
    const checkScroll = () => {
      backtop.hidden = scrollY < 450;
    };
    addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    backtop.onclick = () =>
      window.scrollTo({
        top: 0,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    const search = he_q(".he_search");
    search.elements.q.value = he_params.get("q") || "";
    search.addEventListener("submit", (event) => {
      const query = search.elements.q.value.trim();
      if (query.includes("酒店") || query.includes("民宿")) {
        event.preventDefault();
        location.href = "hotels.html";
      } else if (query.includes("周边") || query.includes("旅游")) {
        event.preventDefault();
        location.href = "travel.html";
      } else search.elements.q.value = query;
    });
    he_q("[data-dialog]").addEventListener("click", (event) => {
      if (event.target === event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          event.currentTarget.close();
      }
    });
  }

  async function he_home() {
    const [banners, products] = await Promise.all([
      he_fetch("banners"),
      he_products(),
    ]);
    const carousel = he_q("[data-carousel]");
    let current = 0,
      paused = matchMedia("(prefers-reduced-motion: reduce)").matches,
      hovered = false,
      focused = false;
    function showSlide() {
      const slide = banners[current];
      carousel.innerHTML = `<a class="he_slide" href="${slide.url}" aria-label="${he_escape(slide.title)}"><img src="${slide.image}" alt="${he_escape(slide.label)}摄影配图"><div class="he_slide_content"><small>${he_escape(slide.label)}</small><h1>${he_escape(slide.title)}</h1><p>${he_escape(slide.subtitle)}</p><span>立即探索 →</span></div></a><div class="he_carousel_controls">${banners.map((_, index) => `<button class="${index === current ? "he_active" : ""}" data-slide="${index}" aria-label="切换到第${index + 1}张推荐" aria-pressed="${index === current}"></button>`).join("")}<button class="he_carousel_pause" data-pause aria-label="${paused ? "播放" : "暂停"}轮播">${paused ? "▶" : "Ⅱ"}</button></div>`;
      he_qa("[data-slide]", carousel).forEach((button) => {
        button.onclick = () => {
          current = Number(button.dataset.slide);
          showSlide();
          he_q(`[data-slide="${current}"]`, carousel).focus();
        };
      });
      he_q("[data-pause]", carousel).onclick = () => {
        paused = !paused;
        showSlide();
        he_q("[data-pause]", carousel).focus();
      };
    }
    showSlide();
    carousel.addEventListener("mouseenter", () => {
      hovered = true;
    });
    carousel.addEventListener("mouseleave", () => {
      hovered = false;
    });
    carousel.addEventListener("focusin", () => {
      focused = true;
    });
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) focused = false;
    });
    const timer = setInterval(() => {
      if (!paused && !hovered && !focused && !document.hidden) {
        current = (current + 1) % banners.length;
        showSlide();
      }
    }, 5500);
    addEventListener("pagehide", () => clearInterval(timer), { once: true });
    const foods = products.filter((item) => item.type === "food");
    const tabs = he_q("[data-home-tabs]");
    function render(category) {
      he_active(tabs, "data-category", category);
      const list = foods
        .filter((item) => category === "全部" || item.category === category)
        .slice(0, 6);
      he_q("[data-home-featured]").innerHTML =
        list.map((item) => he_card(item)).join("") ||
        he_empty("暂无推荐", "换个分类看看吧。");
    }
    tabs.onclick = (event) => {
      const button = event.target.closest("[data-category]");
      if (button) render(button.dataset.category);
    };
    render("全部");
    he_q("[data-home-hotels]").innerHTML = products
      .filter((item) => item.type === "hotel")
      .slice(0, 4)
      .map((item) => he_card(item))
      .join("");
    he_q("[data-home-recommend]").innerHTML = foods
      .slice(3, 8)
      .map((item) => he_card(item))
      .join("");
  }

  async function he_food() {
    const products = (await he_products()).filter(
      (item) => item.type === "food",
    );
    const state = {
      category: he_params.get("category") || "全部",
      area: "全部",
      price: "不限",
      sort: "default",
      page: 1,
      query: (he_params.get("q") || "").trim(),
    };
    const categories = [
      "全部",
      ...new Set(products.map((item) => item.category)),
    ];
    if (!categories.includes(state.category)) state.category = "全部";
    const controls = [
      ["category", categories],
      ["area", ["全部", ...new Set(products.map((item) => item.area))]],
      ["price", ["不限", "50元以下", "50–100元", "100元以上"]],
    ];
    controls.forEach(([key, values]) => {
      const container = he_q(`[data-${key}-filter]`);
      container.innerHTML = values
        .map(
          (value) =>
            `<button data-filter-value="${he_escape(value)}">${he_escape(value)}</button>`,
        )
        .join("");
      container.onclick = (event) => {
        const button = event.target.closest("[data-filter-value]");
        if (button) {
          state[key] = button.dataset.filterValue;
          state.page = 1;
          render();
        }
      };
    });
    he_q("[data-sort-buttons]").onclick = (event) => {
      const button = event.target.closest("[data-sort]");
      if (button) {
        state.sort = button.dataset.sort;
        state.page = 1;
        render();
      }
    };
    function render() {
      controls.forEach(([key]) =>
        he_active(
          he_q(`[data-${key}-filter]`),
          "data-filter-value",
          state[key],
        ),
      );
      he_active(he_q("[data-sort-buttons]"), "data-sort", state.sort);
      let list = products.filter(
        (item) =>
          (state.category === "全部" || item.category === state.category) &&
          (state.area === "全部" || item.area === state.area) &&
          (!state.query ||
            `${item.name}${item.category}${item.package}${item.area}`.includes(
              state.query,
            )) &&
          (state.price === "不限" ||
            (state.price === "50元以下"
              ? item.price < 50
              : state.price === "50–100元"
                ? item.price >= 50 && item.price <= 100
                : item.price > 100)),
      );
      if (state.sort === "price") list.sort((a, b) => a.price - b.price);
      else if (state.sort === "sales") list.sort((a, b) => b.sales - a.sales);
      else if (state.sort === "rating")
        list.sort((a, b) => b.rating - a.rating);
      he_q("[data-result-count]").textContent = `共 ${list.length} 家好店`;
      he_q("[data-search-summary]").textContent = state.query
        ? `“${state.query}”的搜索结果`
        : "";
      const size = 5,
        pageCount = Math.ceil(list.length / size);
      state.page = Math.min(state.page, Math.max(1, pageCount));
      he_q("[data-food-list]").innerHTML =
        list
          .slice((state.page - 1) * size, state.page * size)
          .map(
            (item) =>
              `<article class="he_food_row"><a href="detail.html?id=${item.id}"><img src="${item.image}" alt="${he_escape(item.name)}配图" loading="lazy"></a><div class="he_food_row_content"><a href="detail.html?id=${item.id}"><h3>${he_escape(item.name)}</h3></a><div class="he_card_meta">${he_star(item.rating)}<span>${item.sales}人已购买</span></div><p>${he_escape(item.category)} · ${he_escape(item.area)}</p><div class="he_tags">${item.tags.map((tag) => `<span>${he_escape(tag)}</span>`).join("")}</div><p>${he_escape(item.package)}</p></div><div class="he_food_row_side"><span class="he_price"><small>¥</small>${he_money(item.price)}<small> 起</small></span><a href="detail.html?id=${item.id}" class="he_button">查看详情</a></div></article>`,
          )
          .join("") ||
        he_empty(
          "暂时没有找到相关商家",
          "换个关键词或放宽筛选条件试试。",
          "food.html",
          "清除筛选",
        );
      he_q("[data-pagination]").innerHTML =
        pageCount > 1
          ? `<button data-goto="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="上一页">‹</button>${Array.from({ length: pageCount }, (_, i) => `<button data-goto="${i + 1}" class="${state.page === i + 1 ? "he_active" : ""}" aria-label="第${i + 1}页" ${state.page === i + 1 ? 'aria-current="page"' : ""}>${i + 1}</button>`).join("")}<button data-goto="${state.page + 1}" ${state.page === pageCount ? "disabled" : ""} aria-label="下一页">›</button>`
          : "";
    }
    he_q("[data-pagination]").onclick = (event) => {
      const button = event.target.closest("[data-goto]");
      if (button && !button.disabled) {
        state.page = Number(button.dataset.goto);
        render();
        he_q(".he_sortbar").scrollIntoView({ behavior: "smooth" });
      }
    };
    render();
  }

  function he_date(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function he_stayDays(checkin, checkout) {
    return Math.round(
      (Date.parse(checkout + "T00:00:00Z") -
        Date.parse(checkin + "T00:00:00Z")) /
        86400000,
    );
  }
  async function he_hotels() {
    const products = (await he_products()).filter(
      (item) => item.type === "hotel",
    );
    const form = he_q("[data-hotel-search]");
    form.elements.checkin.min = he_date();
    form.elements.checkin.value = he_date();
    form.elements.checkout.min = he_date(1);
    form.elements.checkout.value = he_date(1);
    let state = {
      area: "全部",
      checkin: he_date(),
      checkout: he_date(1),
      guests: "2",
    };
    function render() {
      const sort = he_q("[data-hotel-sort]").value;
      const list = products.filter(
        (item) => state.area === "全部" || item.area === state.area,
      );
      if (sort === "price") list.sort((a, b) => a.price - b.price);
      if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
      const extra =
        "&" +
        new URLSearchParams({
          checkin: state.checkin,
          checkout: state.checkout,
          guests: state.guests,
        }).toString();
      he_q("[data-hotel-list]").innerHTML =
        list.map((item) => he_card(item, extra)).join("") ||
        he_empty(
          "该区域暂无酒店",
          "试试其他区域。",
          "hotels.html",
          "查看全部酒店",
        );
      he_q("[data-hotel-summary]").textContent =
        `${state.checkin} 至 ${state.checkout} · ${he_stayDays(state.checkin, state.checkout)}晚 · ${state.guests}位成人 · 找到${list.length}家好住处`;
    }
    form.elements.checkin.onchange = () => {
      const next = new Date(form.elements.checkin.value + "T12:00:00");
      next.setDate(next.getDate() + 1);
      const minimum = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
      form.elements.checkout.min = minimum;
      if (form.elements.checkout.value <= form.elements.checkin.value)
        form.elements.checkout.value = minimum;
    };
    form.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      const days = he_stayDays(values.checkin, values.checkout);
      if (
        values.checkin < he_date() ||
        !Number.isFinite(days) ||
        days < 1 ||
        days > 30
      ) {
        he_toast("请选择有效入住日期，入住时长为1至30晚。");
        return;
      }
      state = values;
      render();
      he_toast("已更新酒店筛选结果");
    };
    he_q("[data-hotel-sort]").onchange = render;
    render();
  }
  async function he_travel() {
    const products = (await he_products()).filter(
      (item) => item.type === "travel",
    );
    const tabs = he_q("[data-travel-tabs]");
    function render(category) {
      he_active(tabs, "data-category", category);
      he_q("[data-travel-list]").innerHTML =
        products
          .filter((item) => category === "全部" || item.category === category)
          .map((item) => he_card(item))
          .join("") || he_empty("暂无相关体验", "换个分类继续发现。");
    }
    tabs.onclick = (event) => {
      const button = event.target.closest("[data-category]");
      if (button) render(button.dataset.category);
    };
    const category = he_params.get("category");
    render(
      ["海滨度假", "自然风光", "城市观光", "亲子出游"].includes(category)
        ? category
        : "全部",
    );
  }

  async function he_detail() {
    const [all, reviews] = await Promise.all([
      he_products(true),
      he_fetch("reviews"),
    ]);
    const id = he_params.get("id") || "f01";
    const item = all.find((product) => product.id === id);
    if (!item) {
      he_q("[data-detail-content]").innerHTML = he_empty(
        "这个商品暂时找不到了",
        "可能已被移除，去看看其他好店吧。",
      );
      return;
    }
    he_q("[data-detail-crumb]").textContent = item.name;
    document.title = `${item.name} | 美团 · 24001010908 何良辰`;
    let quantity = 1;
    let checkin = he_params.get("checkin") || he_date(),
      checkout = he_params.get("checkout") || he_date(1);
    let days = he_stayDays(checkin, checkout);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(checkin) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(checkout) ||
      checkin < he_date() ||
      !Number.isFinite(days) ||
      days < 1 ||
      days > 30
    ) {
      checkin = he_date();
      checkout = he_date(1);
      days = 1;
    }
    if (item.type !== "hotel") days = 1;
    const selected = he_favorites().includes(id);
    he_q("[data-detail-content]").innerHTML =
      `<section class="he_detail_top"><img class="he_detail_photo" src="${item.image}" alt="${he_escape(item.name)}摄影配图"><div class="he_detail_info"><span class="he_eyebrow">${item.type === "food" ? "GOOD FOOD, GOOD LIFE" : item.type === "hotel" ? "YOUR NEXT COMFORTABLE STAY" : "DISCOVER SOMETHING GOOD"}</span><h1>${he_escape(item.name)}</h1><div class="he_card_meta">${he_star(item.rating)}<span>已售 ${item.sales}</span><span>${he_escape(item.area)}</span></div><p>${he_escape(item.description)}</p><p>地址：${he_escape(item.address)}</p><p>营业 / 服务时间：${he_escape(item.hours)}</p><div class="he_tags">${item.tags.map((tag) => `<span>${he_escape(tag)}</span>`).join("")}</div><button class="he_button he_button_outline ${selected ? "he_selected" : ""}" data-favorite="${id}" data-favorite-label aria-pressed="${selected}"><img src="image/icon-heart.svg" alt="" width="16" height="16">${selected ? "已收藏" : "收藏商家"}</button></div></section><div class="he_detail_layout"><div><section class="he_white_panel"><div class="he_detail_tabs" role="tablist" aria-label="商家信息"><button class="he_active" role="tab" aria-selected="true" aria-controls="he_panel_package" id="he_tab_package" data-detail-tab="package">套餐详情</button><button role="tab" aria-selected="false" aria-controls="he_panel_notice" id="he_tab_notice" tabindex="-1" data-detail-tab="notice">使用须知</button><button role="tab" aria-selected="false" aria-controls="he_panel_reviews" id="he_tab_reviews" tabindex="-1" data-detail-tab="reviews">用户评价</button></div><div id="he_panel_package" role="tabpanel" aria-labelledby="he_tab_package" data-detail-panel="package"><h2>${he_escape(item.package)}</h2><p class="he_muted">${he_escape(item.description)}</p><ul class="he_package_list">${(item.type ===
      "food"
        ? [
            ["招牌主品", "精选主品 1份"],
            ["人气搭配", "当季配菜 2份"],
            ["饮品 / 茶水", "配套饮品"],
            [
              "套餐人数",
              item.package.includes("单人")
                ? "1人"
                : item.package.includes("三人")
                  ? "3人"
                  : "2人",
            ],
          ]
        : item.type === "hotel"
          ? [
              ["房型", "舒适大床房"],
              ["入住人数", "1–2位成人"],
              ["房间设施", "免费 Wi-Fi / 独立卫浴"],
              ["基础服务", "停车 / 行李寄存"],
            ]
          : [
              ["体验项目", item.category],
              ["使用人数", "1位成人"],
              ["服务时间", "09:00–17:00"],
              ["集合地点", item.address],
            ]
      )
        .map(
          ([label, value]) =>
            `<li><span>${he_escape(label)}</span><strong>${he_escape(value)}</strong></li>`,
        )
        .join(
          "",
        )}</ul><p class="he_muted">摄影图片用于课程视觉展示，套餐为本地演示数据。</p></div><div id="he_panel_notice" role="tabpanel" aria-labelledby="he_tab_notice" data-detail-panel="notice" hidden><h2>使用须知</h2><ul class="he_notice_list"><li>请在使用前确认套餐内容、人数与服务时间。</li><li>${item.type === "hotel" ? "入住时请出示有效身份证件，办理入住手续。" : item.type === "travel" ? "户外活动请提前预约，出行前关注天气情况。" : "高峰时段可能需要等位，请合理安排到店时间。"}</li><li>演示订单可在“我的订单”中取消或标记已使用。</li><li>本项目无真实交易，不收取任何费用。</li></ul></div><div id="he_panel_reviews" role="tabpanel" aria-labelledby="he_tab_reviews" data-detail-panel="reviews" hidden><h2>用户评价 <span class="he_rating">${Number(item.rating).toFixed(1)}</span></h2><p class="he_muted">以下为课程演示评价</p><div class="he_review_filter"><button data-review-filter="all" class="he_active">全部评价</button><button data-review-filter="photo">只看有图</button></div><div data-review-list></div></div></section></div><aside class="he_booking"><h3>${he_escape(item.package)}</h3><p>好生活，就从这一刻开始</p><span class="he_price"><small>¥</small>${he_money(item.price)} <del>¥${he_money(item.originalPrice)}</del></span>${item.type === "hotel" ? `<div class="he_booking_dates">${checkin} → ${checkout}<br>共 ${days} 晚 · 每份为1间房<br><a href="hotels.html" class="he_text_link">修改入住日期 ›</a></div>` : ""}<div class="he_quantity"><span>${item.type === "hotel" ? "房间数量" : "购买数量"}</span><button data-quantity="-1" aria-label="减少数量" disabled>−</button><output data-quantity-value>1</output><button data-quantity="1" aria-label="增加数量">＋</button></div><p>合计 <strong data-total-price>¥${he_money(item.price * days)}</strong></p><button class="he_button" data-book ${!item.active ? "disabled" : ""}>${item.active ? "立即预订" : "商品已下架"}</button><small>课程演示预订，不产生真实扣款。</small></aside></div>`;
    function selectTab(key, focus = false) {
      he_qa("[data-detail-tab]").forEach((button) => {
        const active = button.dataset.detailTab === key;
        button.classList.toggle("he_active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        if (active && focus) button.focus();
      });
      he_qa("[data-detail-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.detailPanel !== key;
      });
    }
    const tabButtons = he_qa("[data-detail-tab]");
    tabButtons.forEach((button, index) => {
      button.onclick = () => selectTab(button.dataset.detailTab);
      button.onkeydown = (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % 3;
        if (event.key === "ArrowLeft") next = (index + 2) % 3;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = 2;
        if (next !== undefined) {
          event.preventDefault();
          selectTab(tabButtons[next].dataset.detailTab, true);
        }
      };
    });
    const relevantReviews =
      item.type === "food"
        ? reviews
        : reviews.map((review) => ({
            ...review,
            text:
              item.type === "hotel"
                ? "入住体验很舒适，房间整洁，出行方便。这是一条住宿场景演示评价。"
                : "行程轻松，景色很好，适合周末放松。这是一条出游场景演示评价。",
            image: review.image ? item.image : null,
          }));
    function renderReviews(filter) {
      he_active(he_q(".he_review_filter"), "data-review-filter", filter);
      he_q("[data-review-list]").innerHTML = relevantReviews
        .filter((review) => filter === "all" || review.image)
        .map(
          (review) =>
            `<article class="he_review"><div><strong>${he_escape(review.name)}</strong><span class="he_rating">${"★".repeat(review.score)}</span><time>${review.date}</time></div><p>${he_escape(review.text)}</p>${review.image ? `<img src="${review.image}" alt="评价配图" loading="lazy">` : ""}</article>`,
        )
        .join("");
    }
    he_qa("[data-review-filter]").forEach((button) => {
      button.onclick = () => renderReviews(button.dataset.reviewFilter);
    });
    renderReviews("all");
    he_qa("[data-quantity]").forEach((button) => {
      button.onclick = () => {
        quantity = Math.min(
          10,
          Math.max(1, quantity + Number(button.dataset.quantity)),
        );
        he_q("[data-quantity-value]").textContent = quantity;
        he_q("[data-total-price]").textContent =
          "¥" + he_money(item.price * quantity * days);
        he_q('[data-quantity="-1"]').disabled = quantity === 1;
        he_q('[data-quantity="1"]').disabled = quantity === 10;
      };
    });
    he_q("[data-book]").onclick = () => {
      const dialog = he_modal(
        "确认演示订单",
        `<p>请确认商品信息，本次操作不会产生真实支付。</p><div class="he_dialog_summary"><h3>${he_escape(item.name)}</h3><p>${he_escape(item.package)}</p><p><span>数量</span><strong>${quantity}份${item.type === "hotel" ? ` × ${days}晚` : ""}</strong></p>${item.type === "hotel" ? `<p><span>入住日期</span><strong>${checkin} 至 ${checkout}</strong></p>` : ""}<p><span>订单合计</span><strong class="he_price">¥${he_money(item.price * quantity * days)}</strong></p></div>`,
        '<button class="he_button he_button_outline" data-cancel>再看看</button><button class="he_button" data-create-order>确认生成演示订单</button>',
      );
      he_q("[data-create-order]", dialog).onclick = async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
          const currentItem = (await he_products()).find(
            (product) => product.id === id,
          );
          if (!currentItem || currentItem.price !== item.price) {
            dialog.close();
            he_toast("商品信息已变更，请刷新页面后重试。");
            return;
          }
          const list = await he_orders();
          const order = {
            id: "MT" + Date.now() + Math.floor(Math.random() * 1000),
            productId: id,
            name: item.name,
            package: item.package,
            image: item.image,
            quantity,
            price: item.price,
            total: Math.round(item.price * quantity * days * 100) / 100,
            status: "待使用",
            createdAt: new Date().toLocaleString("zh-CN"),
            type: item.type,
            ...(item.type === "hotel"
              ? { checkin, checkout, nights: days }
              : {}),
          };
          if (!he_write("orders", [order, ...list])) {
            button.disabled = false;
            return;
          }
          dialog.close();
          he_modal(
            "预订成功",
            `<p>演示订单已生成，可在我的订单中查看或取消。</p><div class="he_dialog_summary"><h3>${he_escape(item.name)}</h3><p>订单号：${order.id}</p></div>`,
            '<button class="he_button he_button_outline" data-cancel>继续逛逛</button><a class="he_button" href="orders.html">查看我的订单</a>',
          );
        } catch (error) {
          button.disabled = false;
          he_toast("生成订单失败，请稍后重试。");
          console.error(error);
        }
      };
    };
  }

  async function he_renderFavorites() {
    const products = await he_products(),
      ids = he_favorites();
    const list = products.filter((item) => ids.includes(item.id));
    he_q("[data-total-favorites]").textContent = list.length;
    he_q("[data-favorites]").innerHTML =
      list.map((item) => he_card(item)).join("") ||
      he_empty(
        "还没有收藏的好店",
        "点击商品卡片上的爱心，把喜欢的店铺留在这里。",
      );
  }
  async function he_profile() {
    const [seed, orders] = await Promise.all([he_fetch("user"), he_orders()]);
    const user = { ...seed, ...he_read("user", {}) };
    const form = he_q("[data-profile-form]");
    Object.entries(user).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
    const render = () => {
      he_q("[data-profile-name]").textContent = user.nickname;
      he_q("[data-profile-bio]").textContent = user.bio;
    };
    render();
    he_q("[data-total-orders]").textContent = orders.length;
    he_q("[data-unused-orders]").textContent = orders.filter(
      (order) => order.status === "待使用",
    ).length;
    await he_renderFavorites();
    form.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      values.nickname = values.nickname.trim();
      values.bio = values.bio.trim();
      if (!values.nickname) {
        he_toast("昵称不能只包含空格");
        form.elements.nickname.focus();
        return;
      }
      if (he_write("user", values)) {
        Object.assign(user, values);
        render();
        he_toast("个人资料已保存");
      }
    };
  }
  async function he_orderPage() {
    let orders = await he_orders();
    let status = ["待使用", "已完成", "已取消"].includes(
      he_params.get("status"),
    )
      ? he_params.get("status")
      : "全部";
    let query = "";
    function render() {
      he_active(he_q("[data-order-tabs]"), "data-status", status);
      const list = orders.filter(
        (order) =>
          (status === "全部" || order.status === status) &&
          `${order.name}${order.id}`.includes(query),
      );
      he_q("[data-orders]").innerHTML =
        list
          .map(
            (order) =>
              `<article class="he_order"><div class="he_order_header"><span>${he_escape(order.createdAt)}</span><span>订单号 ${he_escape(order.id)}</span><strong>${he_escape(order.status)}</strong></div><div class="he_order_body"><a href="detail.html?id=${encodeURIComponent(order.productId)}"><img src="${he_escape(order.image)}" alt="${he_escape(order.name)}配图"></a><div><a href="detail.html?id=${encodeURIComponent(order.productId)}"><h3>${he_escape(order.name)}</h3></a><p>${he_escape(order.package)} × ${order.quantity}</p>${order.type === "hotel" ? `<p>${he_escape(order.checkin)} 至 ${he_escape(order.checkout)} · ${order.nights}晚</p>` : ""}<p>演示订单 · 无真实扣款</p></div><div><span class="he_price"><small>¥</small>${he_money(order.total)}</span><div class="he_order_actions">${order.status === "待使用" ? `<button data-order-action="cancel" data-order-id="${order.id}">取消订单</button><button data-order-action="complete" data-order-id="${order.id}">模拟使用</button>` : `<a href="detail.html?id=${encodeURIComponent(order.productId)}">再次预订</a>`}</div></div></div></article>`,
          )
          .join("") ||
        he_empty(
          query
            ? "没有匹配的订单"
            : status === "全部"
              ? "还没有订单哦"
              : `暂无${status}订单`,
          query
            ? "试试其他商家名称或订单号。"
            : "挑一家喜欢的店，让美好生活开始。",
        );
    }
    he_q("[data-order-tabs]").onclick = (event) => {
      const button = event.target.closest("[data-status]");
      if (button) {
        status = button.dataset.status;
        render();
      }
    };
    he_q("[data-order-search]").oninput = (event) => {
      query = event.target.value.trim();
      render();
    };
    he_q("[data-orders]").onclick = (event) => {
      const button = event.target.closest("[data-order-action]");
      if (!button) return;
      const cancel = button.dataset.orderAction === "cancel";
      he_confirm(
        cancel ? "取消这笔演示订单？" : "模拟使用这笔订单？",
        cancel
          ? "取消后订单会移至已取消列表。"
          : "确认后，订单状态将变为已完成。",
        () => {
          const latest = he_read("orders", orders);
          const next = latest.map((order) =>
            order.id === button.dataset.orderId && order.status === "待使用"
              ? { ...order, status: cancel ? "已取消" : "已完成" }
              : order,
          );
          if (he_write("orders", next)) {
            orders = next;
            render();
            he_toast(cancel ? "订单已取消" : "已模拟使用，订单已完成");
          }
        },
      );
    };
    render();
  }

  async function he_admin() {
    let products = await he_products(true),
      orders = await he_orders(),
      query = "",
      type = "all";
    const label = { food: "美食", hotel: "酒店", travel: "周边游" };
    function render() {
      he_q("[data-admin-total]").textContent = products.length;
      he_q("[data-admin-active]").textContent = products.filter(
        (item) => item.active,
      ).length;
      he_q("[data-admin-orders]").textContent = orders.length;
      he_q("[data-admin-amount]").textContent =
        "¥" +
        he_money(
          orders
            .filter((order) => order.status !== "已取消")
            .reduce((sum, order) => sum + order.total, 0),
        );
      const list = products.filter(
        (item) =>
          (type === "all" || item.type === type) &&
          `${item.name}${item.category}`.includes(query),
      );
      he_q("[data-admin-list]").innerHTML =
        list
          .map(
            (item) =>
              `<article class="he_admin_row"><img src="${he_escape(item.image)}" alt="${he_escape(item.name)}配图"><div><h3>${he_escape(item.name)}</h3><p>${label[item.type]} · ${he_escape(item.package)}</p></div><span>¥${he_money(item.price)}</span><span class="he_status ${item.active ? "" : "he_status_off"}">${item.active ? "已上架" : "已下架"}</span><div><button data-edit-product="${item.id}">编辑</button><button data-toggle-product="${item.id}">${item.active ? "下架" : "上架"}</button><button data-delete-product="${item.id}">删除</button></div></article>`,
          )
          .join("") || he_empty("没有找到相关商品", "试试其他搜索条件。", null);
    }
    async function refresh() {
      products = await he_products(true);
      render();
    }
    he_q("[data-admin-search]").oninput = (event) => {
      query = event.target.value.trim();
      render();
    };
    he_q("[data-admin-type]").onchange = (event) => {
      type = event.target.value;
      render();
    };
    function edit(item) {
      const isNew = !item;
      const model = item || {
        name: "",
        package: "",
        type: "food",
        category: "家常菜",
        area: "高新园区",
        price: "",
        originalPrice: "",
        image: "image/food-hotpot.jpg",
      };
      const images = [...new Set(products.map((product) => product.image))];
      const dialog = he_modal(
        isNew ? "新增商品" : "编辑商品",
        `<form class="he_admin_form" data-product-form><label class="he_form_wide">商家名称<input name="name" required maxlength="40" value="${he_escape(model.name)}"></label><label class="he_form_wide">套餐名称<input name="package" required maxlength="50" value="${he_escape(model.package)}"></label><label>类型<select name="type">${Object.entries(
          label,
        )
          .map(
            ([value, name]) =>
              `<option value="${value}" ${model.type === value ? "selected" : ""}>${name}</option>`,
          )
          .join(
            "",
          )}</select></label><label>分类<input name="category" required maxlength="20" value="${he_escape(model.category)}"></label><label>售价（元）<input name="price" type="number" min="0.01" max="99999" step="0.01" required value="${model.price}"></label><label>原价（元）<input name="originalPrice" type="number" min="0.01" max="99999" step="0.01" required value="${model.originalPrice}"></label><label>区域<input name="area" required maxlength="20" value="${he_escape(model.area)}"></label><label>本地配图<select name="image">${images.map((image) => `<option value="${image}" ${model.image === image ? "selected" : ""}>${image.replace("image/", "")}</option>`).join("")}</select></label><p class="he_inline_error he_form_wide" data-product-error hidden></p><div class="he_dialog_actions he_form_wide"><button type="button" class="he_button he_button_outline" data-cancel>取消</button><button type="submit" class="he_button">保存商品</button></div></form>`,
      );
      he_q("[data-product-form]", dialog).onsubmit = async (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        ["name", "package", "area", "category"].forEach((key) => {
          values[key] = values[key].trim();
        });
        values.price = Number(values.price);
        values.originalPrice = Number(values.originalPrice);
        const error = he_q("[data-product-error]", dialog);
        if (
          !values.name ||
          !values.package ||
          !values.area ||
          !values.category ||
          values.originalPrice < values.price
        ) {
          error.hidden = false;
          error.textContent = "文字内容不能为空，原价不能低于售价。";
          return;
        }
        let saved;
        if (isNew) {
          const added = he_read("added", []);
          added.push({
            ...values,
            id: "c" + Date.now(),
            rating: 4.8,
            sales: 0,
            active: true,
            tags: ["新店推荐", "随时退"],
            description: "发现一家新好店，开启美好生活。",
            address: `大连市${values.area}生活街区`,
            hours: "每日 10:00–22:00",
          });
          saved = he_write("added", added);
        } else {
          const changes = he_read("products", {});
          changes[item.id] = { ...(changes[item.id] || {}), ...values };
          saved = he_write("products", changes);
        }
        if (saved) {
          dialog.close();
          await refresh();
          he_toast("商品已保存，前台页面会同步展示");
        }
      };
    }
    he_q("[data-add-product]").onclick = () => edit();
    he_q("[data-admin-list]").onclick = async (event) => {
      const editButton = event.target.closest("[data-edit-product]"),
        toggle = event.target.closest("[data-toggle-product]"),
        remove = event.target.closest("[data-delete-product]");
      if (editButton)
        edit(
          products.find((item) => item.id === editButton.dataset.editProduct),
        );
      if (toggle) {
        const item = products.find(
          (product) => product.id === toggle.dataset.toggleProduct,
        );
        const changes = he_read("products", {});
        changes[item.id] = {
          ...(changes[item.id] || {}),
          active: !item.active,
        };
        if (he_write("products", changes)) {
          await refresh();
          he_toast(item.active ? "商品已下架" : "商品已上架");
        }
      }
      if (remove) {
        const item = products.find(
          (product) => product.id === remove.dataset.deleteProduct,
        );
        he_confirm(
          "删除这个商品？",
          `删除“${item.name}”后，前台将不再展示它。已有订单记录会保留。`,
          async () => {
            if (he_write("deleted", [...he_read("deleted", []), item.id])) {
              await refresh();
              he_toast("商品已删除");
            }
          },
        );
      }
    };
    render();
  }
  he_common();
  const routes = {
    index: he_home,
    food: he_food,
    detail: he_detail,
    hotels: he_hotels,
    travel: he_travel,
    profile: he_profile,
    orders: he_orderPage,
    admin: he_admin,
  };
  (async () => {
    try {
      await routes[he_page]?.();
    } catch (error) {
      console.error(error);
      const notice = document.createElement("div");
      notice.className = "he_section_error";
      notice.innerHTML = `<strong>暂时无法加载页面数据</strong><p>${location.protocol === "file:" ? "请双击项目中的 start.bat 启动本地服务，再通过 http://localhost:8080 访问。浏览器不允许直接用 file:// 读取 JSON。" : "请检查本地服务是否正常运行，然后重试。"}</p><button data-retry>重新加载</button>`;
      he_q("main").prepend(notice);
      he_q("[data-retry]", notice).onclick = () => location.reload();
    }
  })();
})();
