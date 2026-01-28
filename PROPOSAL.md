# Team Project Proposal

## Project name
Inflation Time Machine

### Description of the project
The "Inflation Time Machine". The purpose of this project is to allow a
user to input a start and end date and a amount. After clicking submit
this should show the user how much that amount would be worth in the end
year. Then we also give the option to the user to see how much of some
item they could purchase with that amount today. Example: I want to see
how much $10k from 1920 is worth today and I can see that if it is worth
$20k today then I could buy X-number of Toyota Camry's, Houses,
Burritos.

### API
US Bureau of Labor Statistics (BLS) API (or similar historical CPI data APIs), Congressional Budget Office, Federal Reserve API, and probably a few others that come up if we need them.

### The Problem: 
"My grandpa says he bought a house for $10,000 in 1950. How much is that actually worth today?"

### The App
Users enter an amount and a past year. The app calculates the modern equivalent purchasing power accounting for inflation.

### Target audience
Users wanting to understand how much something is worth today based off of inflation rates and standard appreciation/depreciation of the underlying asset

## Features and functionalities

Pull data from the BLS or other historical API
Loading animation after the amount and year are entered
Endpoints for serving data
Past searches are saved using localStorage

### At least two wireframes for the main page (mobile, wide screen)
Main Page Desktop - [https://wireframe.cc/AfCToO](https://wireframe.cc/AfCToO)
Main Page Mobile - [https://wireframe.cc/p33UcD](https://wireframe.cc/p33UcD)

Sub Page Desktop - [https://wireframe.cc/IDtVh5](https://wireframe.cc/IDtVh5)
Sub Page Mobile - [https://wireframe.cc/427CNi](https://wireframe.cc/427CNi)

## How the project requirements listed below will be met.

### What will the detailed form be used for? What other forms might you need?
This will be used for submitting the amount and the year and perhaps a short description of the thing purchased. This will then be sent and used in calculating the value of the asset on the current date

### What data would you need to store in Local storage for persistence?
Past/recent searches

### What data will your app need? Is there an API or will you need to build your own dataset in a json file?
There is a BLS API and we may need another API like the FRED (Fed Reserve) API

### Where would it make sense to use a drop-down menu or modal?
We will have a drop down menu to display the equivalent amount to some
item today. Example: I want to see if I bought a house in 1920 worth $X
and I want to see how much that would be worth in 2020, what is that end
amount equivalent to in items today. So if the house would have been
worth $200,000 that is the equivalent of 20k McChickens or 30k Burritos
or 14 Toyota Camry's

### Where are opportunities to use CSS Animations?
For the loading process after submitting the data
 
