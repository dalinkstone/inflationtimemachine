# 🕰️ Inflation Time Machine

**What could your money _really_ buy?**

> A dollar in 1990 isn't a dollar today. Step into the time machine and see exactly what inflation has done to purchasing power across the decades.

---

<p align="center">
  <em>"Inflation is taxation without legislation."</em><br>
  — Milton Friedman
</p>

## The Problem

We all _feel_ inflation — at the grocery store, at the gas pump, in rent checks that climb year after year. But the human brain is terrible at intuiting compound change over time. We remember that a candy bar used to cost a quarter, but we can't quite articulate what that means in the context of wages, housing, and the cost of simply _existing_.

**Inflation Time Machine** makes the invisible visible.

## What This Project Does

This is an interactive web experience that lets you travel through time and witness how the purchasing power of the US dollar has shifted across decades. Select a year, enter an amount, and watch history unfold — not as dry statistics, but as a tangible, visceral comparison of what your money could and can no longer buy.

The goal is simple: **make economic data feel personal.**

## Built With

This project is intentionally minimal. No frameworks. No bundlers. No build steps. Just the fundamentals, done well.

| Layer | Technology |
|-------|-----------|
| Structure | Semantic HTML5 |
| Styling | Vanilla CSS3 |
| Logic | Plain JavaScript |
| Deployment | GitHub Pages via GitHub Actions |

Why? Because clarity beats complexity. Every line of code in this project is readable by anyone who has spent a week learning web development. That's a feature, not a limitation.

## Project Structure

```
inflationtimemachine/
├── index.html              # Home — the main experience
├── subpage1.html           # Additional exploration page
├── css/                    # Stylesheets
├── js/                     # Application logic & data
├── images/                 # Visual assets
└── .github/workflows/      # Automated deployment pipeline
```

## Getting Started

### View it live

Visit the deployed site: [**inflationtimemachine.xyz**](https://inflationtimemachine.xyz)

### Run it locally

Pick your flavor:

**Local server (recommended)**

Using Python (already on most machines):
```bash
python3 -m http.server 8000
```

Using VS Code: Install the **Live Server** extension → right-click `index.html` → _Open with Live Server_.

Then navigate to `http://localhost:8000` (or the port shown) and you're time-traveling.

## The Team

This project is a collaborative effort built for **WDD 231 — Web Frontend Development** at Brigham Young University–Idaho.

| Contributor | Role |
|-------------|------|
| **Dalin Stone** | Backend & Data |
| **Joshua Rushton** | Design & Content |

## Philosophy

There's a school of thought that says every web project needs a framework, a transpiler, a package manager, and 400MB of `node_modules`. We respectfully disagree.

This project proves that **HTML, CSS, and JavaScript are still a complete technology stack.** The browser is the runtime. GitHub Actions is the deployment pipeline. The rest is craft.

## License

This project is an academic work created for educational purposes at BYU-Idaho.

---
