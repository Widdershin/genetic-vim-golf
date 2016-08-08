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

  it('handles the l key', () => {
    const solution = [
      {
        type: 'l'
      },

      {
        type: 'i',
        stringToInsert: 'hello'
      }
    ];

    const input = '--';

    assert.equal(virtualVim({solution, input}), '-hello-');
  });

  it('handles the l key', () => {
    const solution = [
      {
        type: 'l'
      },

      {
        type: 'i',
        stringToInsert: 'hello'
      }
    ];

    const input = '';

    assert.equal(virtualVim({solution, input}), 'hello');
  });

  it('handles the i key end point', () => {
    const solution = [
      {
        type: 'i',
        stringToInsert: 'hello'
      },

      {
        type: 'i',
        stringToInsert: 'hello'
      }
    ];

    const input = '';

    assert.equal(virtualVim({solution, input}), 'hellhelloo');
  });

  it('handles multiline things', () => {
    const input = `*temp var1 0
*temp var2 "hi"
*temp var3 -1
*temp var4 42
*temp var5 "asdf"
*temp var6 0

Simple things we do all the time should be able to be done with very few keystrokes, but sometimes I find something I need to do makes me go, "There MUST be a better way."

This challenge is just a simple movement and entering text at a certain place.
`;

    const solution = [
      {
        type: 'j'
      },
      {
        type: 'j'
      },
      {
        type: 'j'
      },
      {
        type: 'j'
      },
      {
        type: 'j'
      },
      {
        type: 'j'
      },
      {
        type: 'j'
      },
      {
        type: 'j'
      },
      {
        type: 'i',
        stringToInsert: 'New text'
      }
    ]

    const expectedOutput = `*temp var1 0
*temp var2 "hi"
*temp var3 -1
*temp var4 42
*temp var5 "asdf"
*temp var6 0

Simple things we do all the time should be able to be done with very few keystrokes, but sometimes I find something I need to do makes me go, "There MUST be a better way."
New text
This challenge is just a simple movement and entering text at a certain place.
`;

    assert.equal(virtualVim({solution, input}), expectedOutput);
  });
});
