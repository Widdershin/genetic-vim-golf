// http://stackoverflow.com/a/21350614/1404996
function spliceSlice (str, index, count, add='') {
  // We cannot pass negative indexes dirrectly to the 2nd slicing operation.
  const splicedString = str.slice(0, index) + add + str.slice(index + count)

  return [splicedString, str.slice(index, count)];
}

const commands = {
  x (state) {
    const [newText, removedChar] = spliceSlice(state.text, state.cursor.column, 1);

    state.text = newText;
    state.clipboard = removedChar;

    return state;
  },

  p (state) {
    const [newText] = spliceSlice(state.text, state.cursor.column + 1, 0, state.clipboard);

    state.text = newText;

    return state;
  }
};

function executeCommand (state, command) {
  return commands[command.string](state);
}

export default function virtualVim ({solution, input}) {
  const state = {
    text: input,
    cursor: {row: 0, column: 0},
    clipboard: null
  };

  return solution.reduce(executeCommand, state).text;
}
