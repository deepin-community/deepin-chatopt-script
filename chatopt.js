// ==UserScript==
// @name         Deepin ChatOpt
// @namespace    https://myml.dev/
// @version      0.1
// @description  Add Deepin ChatOpt command to github pull request page
// @author       myml
// @match        https://github.com/linuxdeepin/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // add merge button
    const mergeBtn = document.createElement("button")
    mergeBtn.type="button"
    mergeBtn.textContent="/merge"
    mergeBtn.classList="btn"
    mergeBtn.style="float: left;margin-right: 5px;"
    mergeBtn.addEventListener("click",() => {
        document.querySelector("#new_comment_field").value="/merge"
        document.querySelector(".js-new-comment-form").submit()
        document.querySelector("#new_comment_field").value=""
    })
    const actions = document.querySelector("#partial-new-comment-form-actions")
    const firstChild = actions.firstChild
    actions.insertBefore(mergeBtn, firstChild)

    // add re-review button
    const reviewer = document.querySelector(".js-issue-sidebar-form")?.querySelectorAll("span.css-truncate-target") || []
    Array.from(reviewer).forEach(el => {
        const username = el.textContent;
        const reviewBtn = document.createElement("button")
        reviewBtn.type="button"
        reviewBtn.textContent="/review @" + username
        reviewBtn.classList="btn"
        reviewBtn.style="float: left;"
        reviewBtn.addEventListener("click",() => {
            document.querySelector("#new_comment_field").value="/review @" + username
            document.querySelector(".js-new-comment-form").submit()
            document.querySelector("#new_comment_field").value=""
        })
        actions.insertBefore(reviewBtn, firstChild)
    })
    // add re-check button
    const checks = document.querySelectorAll(".merge-status-item")
    Array.from(checks).filter(el=>!el.querySelector('.color-fg-success')).map(el=>el.querySelector('.text-emphasized')).forEach(el => {
        const title = el.getAttribute("title")
        const name = title.split(" ").slice(-2)[0]
        const checkBtn = document.createElement("button")
        checkBtn.type="button"
        checkBtn.textContent="/check " + name
        checkBtn.classList="btn"
        checkBtn.style="float: left;"
        checkBtn.addEventListener("click",() => {
            document.querySelector("#new_comment_field").value="/check " + name
            document.querySelector(".js-new-comment-form").submit()
            document.querySelector("#new_comment_field").value=""
        })
        actions.insertBefore(checkBtn, firstChild)
    })
    // Your code here...
})();
