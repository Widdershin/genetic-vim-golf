/* globals describe, it */

import virtualVim from '../src/virtual-vim';
import assert from 'assert';

const x = {
  type: 'x',
  string: 'x',
  name: 'delete'
}

const p = {
  type: 'p',
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

  it('emulates the editing behaviour of vim', () => {
    const solution = [
      p
    ]

    const input = 'a';

    assert.equal(virtualVim({solution, input}), 'a');
  });

  it('emulates insert commands', () => {
    const solution = [
      {
        type: 'i',
        stringToInsert: 'hello'
      },

      x
    ];

    const input = '';

    assert.equal(virtualVim({solution, input}), 'hell');
  });
});
