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
function loadCPIData() {
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
function calculateInflation(amount, startCPI, endCPI) {
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
function getInflationAdjusted(amount, startYear, endYear) {
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
        multiplier: Math.round(multiplier * 100) / 100
      };
    });
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
function getItemComparisons(amount) {
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
function saveSearch(result) {
  var searches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  searches.unshift({
    startYear: result.startYear,
    endYear: result.endYear,
    original: result.original,
    adjusted: result.adjusted
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
function loadRecentSearches() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}


// ---- RENDER RECENT SEARCHES ----

/**
 * Updates the #recent section in the DOM with saved searches.
 */
function renderRecentSearches() {
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

    div.appendChild(pYear);
    div.appendChild(pAmount);
    div.appendChild(pEnd);
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

        // Get item comparisons
        var items = getItemComparisons(result.adjusted);
        console.log("Item comparisons:", items);

        // ---------------------------------------------------
        // TODO: Replace this alert with actual DOM rendering.
        //
        // result.original   → the dollar amount entered
        // result.adjusted   → the inflation-adjusted amount
        // result.startYear  → base year
        // result.endYear    → end year
        // result.multiplier → how many times the dollar changed
        //
        // items[]           → array of { item, price, quantity }
        // ---------------------------------------------------

        alert(
          "$" + result.original.toLocaleString() + " in " + result.startYear +
          " = $" + result.adjusted.toLocaleString() + " in " + result.endYear +
          " (" + result.multiplier + "x)"
        );
      })
      .catch(function (err) {
        console.error("Inflation error:", err);
        alert("Error: " + err.message);
      });
  });
});
