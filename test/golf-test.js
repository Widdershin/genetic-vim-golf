/* globals describe, it */

import golf from '../index';
import assert from 'assert';

const TESTS = [
  {input: 'ab', output: 'ba', expected: 'xp'},
  {input: 'ab', output: 'b', expected: 'x'},
  {input: 'ab', output: 'baa', expected: 'xpp'},
  {input: 'ab', output: 'baaa', expected: 'xppp'},
  {input: 'aaa', output: '', expected: 'xxx'},
  {input: 'ba', output: 'abbb', expected: 'xppp'}
];

describe('golf', () => {
  TESTS.forEach(test => {
    it(`returns '${test.expected}' to transform '${test.input}' to '${test.output}'`, () => {
      assert.equal(golf(test.input, test.output).toString(), test.expected);
    });
  });
});
