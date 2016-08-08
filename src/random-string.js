import _ from 'lodash';

const letters = 'abcdefghijklmnopqrstuvwyxz';

function randomLetter () {
  const randomLetterIndex = Math.floor(Math.random() * (letters.length - 1));

  return letters[randomLetterIndex];
}

export default function randomString (size) {
  let string = '';

  for (let i = 0; i < size; i++) {
    string += randomLetter();
  };

  return string;
}
