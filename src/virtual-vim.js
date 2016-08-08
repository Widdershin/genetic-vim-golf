import _ from 'lodash';
import randomString from './random-string';
import stringSplice from './string-splice';

function makeRandomString () {
  return randomString(5)
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
    const [newText, removedChar] = stringSplice(state.text, state.cursor.column, 1);

    state.text = newText;
    state.clipboard = removedChar;

    return state;
  },

  p (state) {
    const [newText] = stringSplice(
      state.text,
      state.cursor.column + 1,
      0,
      state.clipboard || ''
    );

    state.text = newText;

    return state;
  },

  i (state, command) {
    const [newText] = stringSplice(
      state.text,
      state.cursor.column,
      0,
      command.stringToInsert
    );

    state.text = newText;
    state.cursor.column += command.stringToInsert.length - 1;

    return state;
  },

  l (state) {
    state.cursor.column += 1;

    return state;
  }
};

function executeCommand (state, command) {
  return commands[command.type](state, command);
}

function generateCommand () {
  return _.sample([x, p, i(), l]);
}

export default function virtualVim ({solution, input}) {
  const state = {
    text: input,
    cursor: {row: 0, column: 0},
    clipboard: null
  };

  return solution.reduce(executeCommand, state).text;
}

virtualVim.generateCommand = generateCommand;
