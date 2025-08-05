// src/js/state.js

let termsData = {};
let termList = [];
let aliasLookup = {};

// ✅ For setting state from a single source
export function setState({ terms, list, aliases }) {
  if (terms) termsData = terms;
  if (list) termList = list;
  if (aliases) aliasLookup = aliases;
}

// ✅ For retrieving state anywhere
export function getState() {
  return { termsData, termList, aliasLookup };
}
