// ============================================================
// subpage.js — Populates subpage1.html with the current result
// ============================================================
// Reads "currentResult" from localStorage and fills in the
// page: original amount, years, adjusted amount, multiplier,
// and item comparisons (uses getItemComparisons from inflation.js).
// ============================================================

import { getItemComparisons } from './inflation.js';

document.addEventListener("DOMContentLoaded", function () {
  var raw = localStorage.getItem("currentResult");
  if (!raw) {
    return;
  }

  var result = JSON.parse(raw);

  // Populate the search inputs section
  document.getElementById("display-start-year").textContent = result.startYear;
  document.getElementById("display-amount").textContent =
    "$" + result.original.toLocaleString();
  document.getElementById("display-end-year").textContent = result.endYear;

  // Populate the results section
  document.getElementById("display-adjusted").textContent =
    "$" + result.adjusted.toLocaleString();
  // Calculate multiplier from CPI values to handle old localStorage entries
  // that may not have the multiplier field
  var multiplier = result.multiplier;
  if (multiplier === undefined || multiplier === null || isNaN(multiplier)) {
    if (result.startCPI && result.endCPI) {
      multiplier = result.endCPI / result.startCPI;
    } else {
      multiplier = 0;
    }
  }
  document.getElementById("display-multiplier").textContent =
    Number(multiplier).toFixed(2) + "x";

  // Populate item comparisons
  var items = getItemComparisons(result.adjusted);
  var list = document.getElementById("display-items");

  for (var i = 0; i < items.length; i++) {
    var li = document.createElement("li");
    li.textContent =
      items[i].quantity.toLocaleString() +
      " " +
      items[i].item +
      (items[i].quantity !== 1 ? "s" : "") +
      " at $" +
      items[i].price.toFixed(2) +
      " each";
    list.appendChild(li);
  }
});
