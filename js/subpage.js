// ============================================================
// subpage.js — Populates subpage1.html with the current result
// ============================================================
// Reads startYear, amount, and endYear from URL params, calls
// getInflationAdjusted to calculate the result, and fills in
// the page: original amount, years, adjusted amount, multiplier,
// and item comparisons.
// ============================================================

import { getInflationAdjusted, getItemComparisons, loadCPIData, calculateInflation, drawLineGraph } from './inflation.js';

document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var startYear = parseInt(params.get("startYear"));
  var amount = parseFloat(params.get("amount"));
  var endYear = parseInt(params.get("endYear"));

  if (!startYear || !amount || !endYear) {
    alert("No data to display. Please go back to the home page and enter your information.");
    window.location.href = "index.html";
    return;
  }

  getInflationAdjusted(amount, startYear, endYear).then(function (result) {
    // Populate the search inputs section
    document.getElementById("display-start-year").textContent = result.startYear;
    document.getElementById("display-amount").textContent =
      "$" + result.original.toLocaleString();
    document.getElementById("display-end-year").textContent = result.endYear;

    // Populate the results section
    document.getElementById("display-adjusted").textContent =
      "$" + result.adjusted.toLocaleString();
    document.getElementById("display-multiplier").textContent =
      result.multiplier.toFixed(2) + "x";

    // Draw growth graph
    loadCPIData().then(function (data) {
      var canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 250;
      canvas.style.maxWidth = "100%";
      var graphSection = document.getElementById("graph");
      var img = graphSection.querySelector("img");
      if (img) graphSection.replaceChild(canvas, img);
      var points = [];
      for (var y = result.startYear; y <= result.endYear; y++) {
        if (data[String(y)] !== undefined) {
          points.push([y, Math.round(calculateInflation(amount, data[String(result.startYear)], data[String(y)]) * 100) / 100]);
        }
      }
      drawLineGraph(canvas, points, "$");
    });

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
});
