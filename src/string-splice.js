// http://stackoverflow.com/a/21350614/1404996
export default function stringSplice (str, index, count, add = '') {
  // We cannot pass negative indexes dirrectly to the 2nd slicing operation.
  const splicedString = str.slice(0, index) + add + str.slice(index + count)

  return [splicedString, str.slice(index, count)];
}

