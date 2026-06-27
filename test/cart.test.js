'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { applyPromo } = require('../src/cart');
test('merges promo into cart', () => {
  const out = applyPromo({ total: 100 }, { discount: 10 });
  assert.equal(out.total, 100); assert.equal(out.discount, 10);
});
