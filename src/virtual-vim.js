import _ from 'lodash';
import randomString from 'randomstring';
import stringSplice from './string-splice';

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

function makeRandomString () {
  return randomString.generate({
    length: 5,
    charset: 'alphabetic',
    capitalization: 'lowercase'
  });
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
  }
};

function executeCommand (state, command) {
  return commands[command.type](state, command);
}

function generateCommand () {
  return _.sample([x, p, i()]);
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
