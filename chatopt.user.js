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
  // 获取员工信息
  function getUniontechInfo(username) {
    if (!uniontechInfoCache[username]) {
      uniontechInfoCache[username] = fetch(
        "https://www-pre.deepin.org/githubid/user/by/github_username/" +
          username
      ).then((resp) => resp.json());
    }
    return uniontechInfoCache[username];
  }
  // 添加员工信息到头像鼠标悬浮弹出框
  async function addUniontechInfo() {
    const pop = Array.from(document.querySelectorAll(".Popover")).filter(
      (pop) => pop.childElementCount
    )[0];
    if (pop.style.display == "none") {
      return;
    }
    if (pop.querySelector(".uniontech-job-number")) {
      return;
    }
    const nameEl = Array.from(pop.querySelectorAll("section")).filter(
      (el) => el.getAttribute("aria-label") === "User login and name"
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
  // 添加员工信息到编辑框的@弹出框
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
  // 添加员工信息到issue指派
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
  // 添加指令按钮，包括 merge check integrate
  function addCommandBtn() {
    if (document.querySelector(".deepin-action-group")) {
      return;
    }
    const actions = document.querySelector("#partial-new-comment-form-actions");
    if (!actions) {
      return;
    }
    const group = document.createElement("div");
    const commands = [
      { name: "merge", input: "/merge", title: "合并这个提交" },
      { name: "approve", input: "/approve", title: "允许合并这个提交" },
      { name: "integrate", input: "/integrate", title: "发起仓库集成" },
      { name: "lgtm", input: "/lgtm", title: "看起来还不错+1" },
      {
        name: "assign",
        input: "/assign @",
        title: "分配给某人",
        no_submit: true,
      },
      {
        name: "label",
        input: "/label ",
        title: "添加标签",
        no_submit: true,
      },
    ];
    for (let command of commands) {
      // 添加 /merge 指令按钮
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = command.name;
      btn.classList = "btn";
      btn.title = command.title;
      btn.addEventListener("click", () => {
        const edit = document.querySelector("#new_comment_field");
        edit.value = command.input + " " + edit.value;
        edit.focus();
        if (!command.no_submit) {
          document.querySelector(".js-new-comment-form").submit();
          document.querySelector("#new_comment_field").value = "";
        }
      });
      group.appendChild(btn);
    }

    group.classList = "deepin-action-group";
    group.style =
      "float: left;display: flex;flex-wrap: wrap;grid-gap: 0.5rem;max-width: 600px;";
    const firstChild = actions.firstChild;
    actions.insertBefore(group, firstChild);
  }
  let observerInterval = 0;
  let observer = new MutationObserver(() => {
    // 500ms 防抖
    clearInterval(observerInterval);
    observerInterval = setTimeout(() => {
      addUniontechName();
      addUniontechName2();
      addUniontechInfo();
      addCommandBtn();
    }, 500);
  });
  observer.observe(document.body, { subtree: true, childList: true });
})();
