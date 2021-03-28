export const toCamelCase = (string) => {
  return string[0].toLowerCase() + string.slice(1);
};

/**
 * returns highest match to a given needle, that doesn't exceed needle
 *
 * @param {Array} array
 * @param {Number} needle
 * @returns
 */
export const getHighestMatch = (array, needle) => {
  let highest_match;
  for (let floor of array) {
    if (floor > needle) {
      break;
    }
    highest_match = floor;
  }
  return highest_match;
};

/**
 * gets weighted chances for all entities based on the level provided
 * Object structure:
 *   level: [{entity, weight}, {entity, weight}] *
 *
 * @param {Object} weightedChances
 * @param {Number} level
 * @returns {Object}
 */
export const getEntityChancesForLevel = (weightedChances, level) => {
  const entityWeightedChances = {};

  for (const floor in weightedChances) {
    if (floor > level) {
      break;
    } else {
      weightedChances[floor].forEach((entity) => {
        entityWeightedChances[entity.name] = entity.weight;
      });
    }
  }
  return entityWeightedChances;
};

/**
 * gets weighted key based on values from an object
 * Object structure
 * data: {key: weighting}
 *
 * @param {object} data
 * @returns key
 */
export const getWeightedValue = (data) => {
  let total = 0;

  for (let key in data) {
    total += data[key];
  }

  let random = Math.random() * total;
  let key,
    part = 0;
  for (key in data) {
    part += data[key];
    if (random < part) {
      return key;
    }
  }

  // If by some floating-point annoyance we have
  // random >= total, just return the last id.
  return key;
};
