'use strict';

// Reproduction for GHSA-f23m-r3pf-42rh (CVE-2026-2950):
// lodash Prototype Pollution via array-path bypass affecting deep path
// operations (_.merge / _.set / _.unset / _.omit).
//
// Reachable sink in this repo: src/cart.js -> applyPromo(cart, promo)
// merges a USER-SUPPLIED promo object into the cart via _.merge. A crafted
// promo with a __proto__ key pollutes Object.prototype on the vulnerable
// lodash (< 4.18.0). On the patched lodash (>= 4.18.0) it does not.
//
// BEFORE the fix (lodash 4.17.15): pollution succeeds -> assertions FAIL.
// AFTER the fix  (lodash 4.18.0):  pollution blocked  -> assertions PASS.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { applyPromo } = require('../src/cart');

function cleanup() {
  delete Object.prototype.polluted;
  delete Object.prototype.isAdmin;
}

test('applyPromo must not let a __proto__ promo pollute Object.prototype (reachable sink)', () => {
  cleanup();
  try {
    // Attacker-controlled promo payload as it would arrive from JSON input.
    const promo = JSON.parse('{"__proto__": {"polluted": "yes"}}');
    applyPromo({ total: 100 }, promo);
  } finally {
    const leaked = {}.polluted;
    cleanup();
    assert.equal(leaked, undefined, 'Object.prototype was polluted via applyPromo/_.merge');
  }
});

test('lodash deep path APIs must not pollute via array-path bypass', () => {
  cleanup();
  const _ = require('lodash');
  try {
    _.set({}, ['__proto__', 'isAdmin'], true);
  } catch (e) {
    // a guarded/patched implementation may throw — acceptable
  }
  const leaked = {}.isAdmin;
  cleanup();
  assert.notEqual(leaked, true, 'Object.prototype was polluted via array-path bypass');
});
