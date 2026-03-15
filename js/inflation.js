// ============================================================
// inflation.js — Inflation Time Machine
// ============================================================
// Loads historical CPI data from a local JSON file (sourced
// from the FRED API / U.S. Bureau of Labor Statistics) and
// calculates inflation-adjusted dollar amounts.
//
// No API key needed. No CORS issues. Works offline.
//
// Data source: BLS CPI-U, Not Seasonally Adjusted, Annual Avg.
// Series: CPIAUCNS (1913–present), base period 1982-84=100
// ============================================================


// ---- CPI DATA ----

// This will hold the parsed CPI data once loaded
var cpiData = null;

/**
 * Loads the CPI data from the local JSON file.
 * Only fetches once — after that it returns the cached data.
 *
 * @returns {Promise<Object>} - keys are year strings, values are CPI numbers
 */
export function loadCPIData() {
  if (cpiData !== null) {
    return Promise.resolve(cpiData);
  }

  return fetch("js/cpi-data.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load CPI data file.");
      }
      return response.json();
    })
    .then(function (json) {
      cpiData = json.data;
      return cpiData;
    });
}


// ---- INFLATION MATH ----

/**
 * adjustedAmount = amount × (endCPI / startCPI)
 */
export function calculateInflation(amount, startCPI, endCPI) {
  return amount * (endCPI / startCPI);
}


/**
 * The main function. Takes a dollar amount, start year, and end year.
 * Returns a promise that resolves to an object with all the details.
 *
 * @param {number} amount    - e.g. 10000
 * @param {number} startYear - e.g. 1950
 * @param {number} endYear   - e.g. 2024
 * @returns {Promise<Object>}
 */
export function getInflationAdjusted(amount, startYear, endYear) {
  return loadCPIData()
    .then(function (data) {
      var startCPI = data[String(startYear)];
      var endCPI = data[String(endYear)];

      if (startCPI === undefined) {
        throw new Error(
          "No CPI data for " + startYear + ". Data available from 1913 to 2025."
        );
      }
      if (endCPI === undefined) {
        throw new Error(
          "No CPI data for " + endYear + ". Data available from 1913 to 2025."
        );
      }

      var adjusted = calculateInflation(amount, startCPI, endCPI);
      var multiplier = endCPI / startCPI;

      return {
        original: amount,
        adjusted: Math.round(adjusted * 100) / 100,
        startYear: startYear,
        endYear: endYear,
        startCPI: startCPI,
        endCPI: endCPI,
        multiplier: Number(multiplier.toFixed(2))
      };
    });
}


// ---- LINE GRAPH ----

/**
 * Draws a simple line graph on a canvas.
 * points = [[x, y], [x, y], ...]
 */
export function drawLineGraph(canvas, points, yPrefix, ySuffix) {
  if (!ySuffix) ySuffix = "";
  var ctx = canvas.getContext("2d");
  var w = canvas.width, h = canvas.height;
  var padLeft = 60, padRight = 20, padTop = 20, padBottom = 40;
  var minX = points[0][0], maxX = points[points.length - 1][0];
  var ys = points.map(function (p) { return p[1]; });
  var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
  if (maxY === minY) maxY = minY + 1;
  function sx(x) { return padLeft + (x - minX) / (maxX - minX) * (w - padLeft - padRight); }
  function sy(y) { return h - padBottom - (y - minY) / (maxY - minY) * (h - padTop - padBottom); }
  ctx.clearRect(0, 0, w, h);

  // Draw axes
  ctx.strokeStyle = "#003D5B";
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop); ctx.lineTo(padLeft, h - padBottom); ctx.lineTo(w - padRight, h - padBottom);
  ctx.stroke();

  // Draw line graph
  ctx.strokeStyle = "#3C6E71";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx(points[0][0]), sy(points[0][1]));
  for (var i = 1; i < points.length; i++) ctx.lineTo(sx(points[i][0]), sy(points[i][1]));
  ctx.stroke();

  // Axis tick helpers
  ctx.fillStyle = "#483C46";
  ctx.font = "11px Tinos, serif";
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 0.5;

  // X-axis ticks (aim for ~5 ticks)
  var xRange = maxX - minX;
  var xStep = Math.ceil(xRange / 5 / 10) * 10; // round to nearest 10
  if (xStep < 1) xStep = 1;
  for (var xVal = Math.ceil(minX / xStep) * xStep; xVal <= maxX; xVal += xStep) {
    var xPos = sx(xVal);
    ctx.beginPath();
    ctx.moveTo(xPos, h - padBottom);
    ctx.lineTo(xPos, h - padBottom + 5);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(String(xVal), xPos, h - padBottom + 16);
  }

  // Y-axis ticks (aim for ~5 ticks)
  var yRange = maxY - minY;
  var yMag = Math.pow(10, Math.floor(Math.log10(yRange)));
  var yStep = yMag;
  if (yRange / yStep < 3) yStep = yMag / 2;
  if (yRange / yStep > 8) yStep = yMag * 2;
  var yStart = Math.ceil(minY / yStep) * yStep;
  for (var yVal = yStart; yVal <= maxY; yVal += yStep) {
    var yPos = sy(yVal);
    // Grid line
    ctx.beginPath();
    ctx.moveTo(padLeft, yPos);
    ctx.lineTo(w - padRight, yPos);
    ctx.stroke();
    // Label
    ctx.textAlign = "right";
    var yLabel;
    if (ySuffix === "%") {
      yLabel = yVal.toFixed(1) + ySuffix;
    } else {
      yLabel = yPrefix + Math.round(yVal).toLocaleString() + ySuffix;
    }
    ctx.fillText(yLabel, padLeft - 5, yPos + 4);
  }
}


// ---- ITEM COMPARISONS ----

// Current approximate prices for the "what can you buy" feature.
var itemPrices = {
  "McDonald's Big Mac":       5.58,
  "Chipotle Burrito":         10.70,
  "Gallon of Gas":            3.30,
  "Movie Ticket":             11.00,
  "Toyota Camry":             28000,
  "Median US Home":           420000,
  "iPhone":                   999,
  "Year of College Tuition":  24000,
  "Dozen Eggs":               3.50,
  "Cup of Coffee":            5.00
};

/**
 * Given a dollar amount, returns how many of each item you could buy.
 */
export function getItemComparisons(amount) {
  var results = [];
  var items = Object.keys(itemPrices);

  for (var i = 0; i < items.length; i++) {
    var name = items[i];
    var price = itemPrices[name];
    var quantity = Math.floor(amount / price);

    results.push({
      item: name,
      price: price,
      quantity: quantity
    });
  }

  return results;
}


// ---- LOCAL STORAGE (Recent Searches) ----

var STORAGE_KEY = "inflationRecentSearches";
var MAX_RECENT = 3;

/**
 * Saves a search result to localStorage.
 */
export function saveSearch(result) {
  var searches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  searches.unshift({
    startYear: result.startYear,
    endYear: result.endYear,
    original: result.original,
    adjusted: result.adjusted,
    startCPI: result.startCPI,
    endCPI: result.endCPI,
    multiplier: result.multiplier
  });

  // Keep only the most recent 3
  if (searches.length > MAX_RECENT) {
    searches = searches.slice(0, MAX_RECENT);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

/**
 * Loads recent searches from localStorage.
 */
export function loadRecentSearches() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}


// ---- RENDER RECENT SEARCHES ----

/**
 * Updates the #recent section in the DOM with saved searches.
 */
export function renderRecentSearches() {
  var recentSection = document.getElementById("recent");
  if (!recentSection) {
    return;
  }

  // Keep the h1, remove everything else
  var heading = recentSection.querySelector("h1");
  recentSection.innerHTML = "";
  recentSection.appendChild(heading);

  var searches = loadRecentSearches();

  // If no searches saved, show the empty state
  if (searches.length === 0) {
    var emptyDiv = document.createElement("div");
    emptyDiv.className = "lookUp";
    var emptyP = document.createElement("p");
    emptyP.textContent = "No recent look up";
    emptyDiv.appendChild(emptyP);
    recentSection.appendChild(emptyDiv);
    return;
  }

  // Build a card for each saved search
  for (var i = 0; i < searches.length; i++) {
    var search = searches[i];

    var div = document.createElement("div");
    div.className = "lookUp";

    var pYear = document.createElement("p");
    pYear.textContent = "Year - " + search.startYear;

    var pAmount = document.createElement("p");
    pAmount.textContent = "Amount - $" + search.original.toLocaleString();

    var pEnd = document.createElement("p");
    pEnd.textContent = "End Year - " + search.endYear;

    var pResult = document.createElement("p");
    pResult.textContent = "Result - $" + search.adjusted.toLocaleString();

    div.appendChild(pYear);
    div.appendChild(pAmount);
    div.appendChild(pEnd);
    div.appendChild(pResult);

    // Click handler: save this search as currentResult and go to subpage
    (function (s) {
      div.addEventListener("click", function () {
        window.location.href = "subpage1.html?startYear=" + s.startYear + "&amount=" + s.original + "&endYear=" + s.endYear;
      });
    })(search);

    recentSection.appendChild(div);
  }
}


// ---- FORM HANDLING ----

document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector("#form form");
  var bYearInput = document.getElementById("b_year");
  var amountInput = document.getElementById("amount");
  var eYearInput = document.getElementById("e_year");

  // Render any saved recent searches on page load
  renderRecentSearches();

  // Draw inflation overview graph on home page
  var graphSection = document.getElementById("graph");
  if (graphSection && !document.getElementById("search")) {
    loadCPIData().then(function (data) {
      var canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 250;
      canvas.style.maxWidth = "100%";
      var img = graphSection.querySelector("img");
      if (img) graphSection.replaceChild(canvas, img);
      var points = [];
      for (var y = 1915; y <= 2025; y++) {
        var curCPI = data[String(y)];
        var prevCPI = data[String(y - 1)];
        if (curCPI !== undefined && prevCPI !== undefined) {
          var rate = ((curCPI - prevCPI) / prevCPI) * 100;
          points.push([y, Math.round(rate * 10) / 10]);
        }
      }
      drawLineGraph(canvas, points, "", "%");
    });
  }

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var startYear = parseInt(bYearInput.value);
    var amount = parseFloat(amountInput.value);
    var endYear = parseInt(eYearInput.value);

    // Basic validation
    if (!startYear || !amount || !endYear) {
      alert("Please fill in all three fields.");
      return;
    }

    if (startYear < 1913 || endYear < 1913) {
      alert("CPI data is only available from 1913 onward.");
      return;
    }

    if (startYear >= endYear) {
      alert("End year must be after the base year.");
      return;
    }

    // Calculate inflation
    getInflationAdjusted(amount, startYear, endYear)
      .then(function (result) {
        console.log("Result:", result);

        // Save to localStorage and re-render recent section
        saveSearch(result);
        renderRecentSearches();

        // Save full result for subpage display and redirect
        window.location.href = "subpage1.html?startYear=" + result.startYear + "&amount=" + result.original + "&endYear=" + result.endYear;
      })
      .catch(function (err) {
        console.error("Inflation error:", err);
        alert("Error: " + err.message);
      });
  });
});
