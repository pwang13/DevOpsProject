const assert = require('assert');
var subject = require('./mystery.js')

assert(subject.inc(100, 1) === 101);
assert(subject.inc(-101, 1) === 102);

console.log('OK');
