// ==UserScript==
// @name         Deepin ChatOpt
// @namespace    https://github.com/deepin-community
// @version      0.1
// @description  Add Deepin ChatOpt command to github pull request page
// @author       wurongjie@deepin.org
// @match        https://github.com/linuxdeepin/**
// @match        https://github.com/deepin-community/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let uniontechInfoCache = {};
  function getUniontechInfo(username) {
    if (!uniontechInfoCache[username]) {
      uniontechInfoCache[username] = fetch(
        "https://www-pre.deepin.org/githubid/user/by/github_username/" +
          username,
      ).then((resp) => resp.json());
    }
    return uniontechInfoCache[username];
  }
  // 添加到头像鼠标悬浮弹出框
  async function addUniontechInfo() {
    const pop = Array.from(document.querySelectorAll(".Popover")).filter(
      (pop) => pop.childElementCount,
    )[0];
    if (pop.style.display == "none") {
      return;
    }
    if (pop.querySelector(".uniontech-job-number")) {
      return;
    }
    const nameEl = Array.from(pop.querySelectorAll("section")).filter(
      (el) => el.getAttribute("aria-label") === "user login and name",
    )[0];
    if (!nameEl) {
      return;
    }
    const username = nameEl.querySelector("a").getAttribute("href").slice(1);
    const info = await getUniontechInfo(username);
    console.log("username", username, info);
    const jobEl = document.createElement("section");
    jobEl.classList = "uniontech-job-number";
    const email = `<a href='mailto://${info["uniontech_username"]}@uniontech.com'>${info["uniontech_username"]}</a>`;
    jobEl.innerHTML =
      `<strong>${info["uniontech_id"].toUpperCase()}</strong> <span>${
        info["uniontech_nickname"]
      }</span> ` + email;
    nameEl.parentNode.insertBefore(jobEl, nameEl.nextSibling);
  }
  // 添加到编辑框的@弹出框
  async function addUniontechName() {
    const container = document.querySelector("ul.suggester-container");
    if (!container) {
      return;
    }
    const items = Array.from(container.querySelectorAll("li"));
    for (const item of items) {
      if (item.querySelector(".uniontech-name")) {
        continue;
      }
      const username = item.querySelector("span").innerText;
      let info;
      try {
        info = await getUniontechInfo(username);
      } catch (err) {
        continue;
      }
      const uniontechName = document.createElement("span");
      uniontechName.innerText = `${info.uniontech_nickname}(${info.uniontech_id})`;
      uniontechName.classList = "uniontech-name";
      item.append(uniontechName);
    }
  }
  // 添加到issue指派
  async function addUniontechName2() {
    const items = Array.from(document.querySelectorAll(".js-username"));
    for (const item of items) {
      const username = item.innerText;
      const el = item.parentElement;
      if (el.querySelector(".uniontech-name")) {
        continue;
      }
      let info;
      try {
        info = await getUniontechInfo(username);
      } catch (err) {
        continue;
      }
      const uniontechName = document.createElement("span");
      uniontechName.innerText = `${info.uniontech_nickname}(${info.uniontech_id})`;
      uniontechName.classList = "uniontech-name";
      el.append(uniontechName);
    }
  }
  let observerInterval = 0;
  let observer = new MutationObserver(() => {
    // 300ms 防抖
    clearInterval(observerInterval);
    observerInterval = setTimeout(() => {
      addUniontechName();
      addUniontechName2();
      addUniontechInfo();
    }, 300);
  });
  observer.observe(document.body, { subtree: true, childList: true });

  // 避免卡顿页面，只循环十次
  let i = 0;
  const interval = setInterval(() => {
    console.log("try append deepin action group");
    const actions = document.querySelector("#partial-new-comment-form-actions");
    if (!actions) {
      return;
    }
    i++;
    if (i > 10) {
      clearInterval(interval);
    }
    if (document.querySelector(".deepin-action-group")) {
      actions.removeChild(document.querySelector(".deepin-action-group"));
    }
    const firstChild = actions.firstChild;
    const group = document.createElement("div");
    group.classList = "deepin-action-group";
    group.style =
      "float: left;display: flex;flex-wrap: wrap;grid-gap: 0.5rem;max-width: 600px;";
    actions.insertBefore(group, firstChild);

    // 添加 /merge 指令按钮
    const mergeBtn = document.createElement("button");
    mergeBtn.type = "button";
    mergeBtn.textContent = "/merge";
    mergeBtn.classList = "btn";
    mergeBtn.addEventListener("click", () => {
      document.querySelector("#new_comment_field").value = "/merge";
      document.querySelector(".js-new-comment-form").submit();
      document.querySelector("#new_comment_field").value = "";
    });
    group.appendChild(mergeBtn);

    // 添加 /check 指令按钮
    const checks = document.querySelectorAll(
      ".merge-status-item .color-fg-muted",
    );
    Array.from(checks).forEach((el) => {
      if (!el.innerText?.includes("Failing")) {
        return;
      }
      const name = el.innerText
        .slice(0, el.innerText.indexOf("("))
        .replace(/ /g, "")
        .split("/")
        .slice(1)
        .join("/");
      const checkBtn = document.createElement("button");
      checkBtn.type = "button";
      checkBtn.classList = "btn";
      checkBtn.textContent = "/check " + name;
      checkBtn.addEventListener("click", () => {
        document.querySelector("#new_comment_field").value = "/check " + name;
        document.querySelector(".js-new-comment-form").submit();
        document.querySelector("#new_comment_field").value = "";
      });
      group.appendChild(checkBtn);
    });
  }, 1000);
})();
