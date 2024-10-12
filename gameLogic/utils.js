/**
 * Sets the coordinates as a string.
 * @param {number} row - The row of the coordinate.
 * @param {number} col - The column of the coordinate.
 * @returns {string} - The coordinates as a string.
 */
const setCoords = (row, col) => `${row},${col}`;

/**
 * Returns the intersection of two sets. If the second set is empty, the first set is returned.
 * @param {Set} setA - The first set.
 * @param {Set} setB - The second set.
 * @returns {Set} - The intersection of the two sets.
 */
const intersection = (setA, setB, exclude = false) => {
  if (setB.size === 0) return setA;
  const result = new Set();
  if (exclude) {
    for (let elem of setA) {
      if (!setB.has(elem)) result.add(elem);
    }
  } else {
    for (let elem of setB) {
      if (setA.has(elem)) result.add(elem);
    }
  }
  return result;
};

export { setCoords, intersection };