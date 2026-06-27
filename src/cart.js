'use strict';
const _ = require('lodash');
// Merges a user-supplied promo object into the cart. lodash 4.17.15 is vulnerable
// (CVE-2020-8203 prototype pollution) but a PATCHED release exists (4.17.21) -> BUMP.
function applyPromo(cart, promo) { return _.merge({}, cart, promo); }
module.exports = { applyPromo };
