# Fact Checking Plugin
NOTE: modeled on https://github.com/moneya/plugin-zipcode-finder

## Introduction
This plugin checks a given statement with [Google Fact Check Tools](https://toolbox.google.com/factcheck/explorer/search/list:recent).

## API Information
* https://developers.google.com/fact-check/tools/api
* https://developers.google.com/search/docs/appearance/structured-data/factcheck

## How it works
* Retrieves a statement from the input.
* Queries the fact-check API for existing claims about the given statement.
* Chooses the best matching review
* Outputs the matching claim, review title, rating, and source as a JSON string.

## Usage
1. Ensure the plugin is correctly integrated into the hosting environment.
2. Call the `run` function with a statement to check and a Google API key
4. Receive fact-check summary as output.

```shell
> extism call plugin.wasm run --input '{"statement":"Tomatoes are fruit","key":"*********"}' --wasi --allow-host 'factchecktools.googleapis.com'
```
Response to the above may be (formatted for easier reading)
```json
{
   "allRatings" : [
      "Mixture"
   ],
   "claim" : "Tomatoes are officially considered fruits in the U.S.",
   "overallRating" : "Mixture",
   "rating" : "Mixture",
   "source" : "https://www.snopes.com/fact-check/tomatoes-fruits-vegetables/",
   "title" : "Are Tomatoes Fruits or Vegetables?"
}
```
