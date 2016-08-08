import _ from 'lodash';
import randomString from './random-string';
import stringSplice from './string-splice';

function makeRandomString () {
  return randomString(_.random(1, 10))
}

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

const l = {
  type: 'l',
  string: 'l',
  name: 'right'
}

const j = {
  type: 'j',
  string: 'j',
  name: 'down'
}

function i () {
  const stringToInsert = makeRandomString();

  return {
    type: 'i',
    string: `i${stringToInsert}<Esc>`,
    stringToInsert,
    name: 'insert'
  }
}

const commands = {
  x (state) {
    const line = currentLine(state);

    const [newText, removedChar] = stringSplice(line, state.cursor.column, 1);

    state.text.splice(state.cursor.row, 1, newText);
    state.clipboard = removedChar;

    return state;
  },

  p (state) {
    const line = currentLine(state);

    const [newText] = stringSplice(
      line,
      state.cursor.column + 1,
      0,
      state.clipboard || ''
    );

    state.text.splice(state.cursor.row, 1, newText);

    return state;
  },

  i (state, command) {
    const line = currentLine(state);

    const [newText] = stringSplice(
      line,
      state.cursor.column,
      0,
      command.stringToInsert
    );

    state.text.splice(state.cursor.row, 1, newText);

    state.cursor.column += command.stringToInsert.length - 1;

    return state;
  },

  l (state) {
    state.cursor.column += 1;

    return state;
  },

  j (state) {
    state.cursor.row += 1;

    if (state.cursor.row > state.text.length - 1) {
      state.cursor.row = state.text.length - 1;
    }

    return state;
  }
};

function executeCommand (state, command) {
  return commands[command.type](state, command);
}

function generateCommand () {
  return _.sample([x, p, i(), l, j]);
}

function currentLine (state) {
  return state.text[state.cursor.row];
}

export default function virtualVim ({solution, input}) {
  const state = {
    text: input.split('\n'),
    cursor: {row: 0, column: 0},
    clipboard: null
  };

  return solution.reduce(executeCommand, state).text.join('\n');
}

virtualVim.generateCommand = generateCommand;
