/* globals describe, it */

import golf from '../index';
import assert from 'assert';

const TESTS = [
  {input: 'ab', output: 'ba', expected: 'xp'},
  {input: 'ab', output: 'b', expected: 'x'},
  {input: 'ab', output: 'baa', expected: 'xpp'},
  {input: 'ab', output: 'baaa', expected: 'xppp'},
  {input: 'aaa', output: '', expected: 'xxx'},
  {input: 'ba', output: 'abbb', expected: 'xppp'},
  {input: '', output: 'hello', expected: 'ihello<Esc>'},
  {input: '--', output: '-hello-', expected: 'lihello<Esc>'}
];

describe('golf', () => {
  TESTS.forEach(test => {
    it(`returns '${test.expected}' to transform '${test.input}' to '${test.output}'`, (done) => {
      const stream = golf(test.input, test.output);

      stream.filter(result => {
        return result.result === test.output;
      }).take(1).addListener({
        next: (result) => {
          assert.equal(result.solution, test.expected);
          done();
        },

        error: done,
        complete: () => {}
      });
    });
  });
});
