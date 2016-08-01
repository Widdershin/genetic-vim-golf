/* globals describe, it */

import virtualVim from '../src/virtual-vim';
import assert from 'assert';

const x = {
  string: 'x',
  name: 'delete'
}

const p = {
  string: 'p',
  name: 'put'
}

describe('virtual vim', () => {
  it('emulates the editing behaviour of vim', () => {
    const solution = [
      x,
      p
    ]

    const input = 'ab';

    assert.equal(virtualVim({solution, input}), 'ba');
  });
});
