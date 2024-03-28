//// Render loader and transition header to top of page on click of Search button
const head = document.getElementById("header");
const headDivider = document.getElementById("head-divider");
const loader = document.getElementById("loader");
const search = document.getElementById("loc-search");

document.getElementById("search-btn").addEventListener("click", () => {
  head.classList.add("make-space");
  headDivider.classList.remove("hide");
  loader.classList.remove("hide");
  search.classList.remove("col");
});
