/**
 * Utility functions for catalog items sorting
 */

/**
 * Parses the year of an item safely.
 * Handles strings like "2008", "2008-2013", integers, and missing values.
 *
 * @param {Object} item
 * @returns {number}
 */
export function getItemYear(item) {
  if (!item || !item.year) return 0;
  const parsed = parseInt(item.year, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Gets the clean title/name of an item.
 *
 * @param {Object} item
 * @returns {string}
 */
export function getItemTitle(item) {
  return (item?.title || item?.name || '').toString().trim();
}

/**
 * Sorts catalog items according to a given sort option.
 * If sortOption is 'manual' or falsy, returns items unchanged.
 * If sortOption is an automated sort, returns a sorted copy of the array.
 *
 * @param {Array} items
 * @param {string} sortOption - 'manual' | 'year-asc' | 'year-desc' | 'alpha'
 * @returns {Array}
 */
export function sortItems(items, sortOption) {
  if (!Array.isArray(items) || items.length <= 1 || !sortOption || sortOption === 'manual') {
    return items || [];
  }

  const copy = [...items];

  if (sortOption === 'year-asc') {
    copy.sort((a, b) => {
      const diff = getItemYear(a) - getItemYear(b);
      if (diff !== 0) return diff;
      return getItemTitle(a).localeCompare(getItemTitle(b), undefined, { numeric: true, sensitivity: 'base' });
    });
  } else if (sortOption === 'year-desc') {
    copy.sort((a, b) => {
      const diff = getItemYear(b) - getItemYear(a);
      if (diff !== 0) return diff;
      return getItemTitle(a).localeCompare(getItemTitle(b), undefined, { numeric: true, sensitivity: 'base' });
    });
  } else if (sortOption === 'alpha') {
    copy.sort((a, b) => {
      return getItemTitle(a).localeCompare(getItemTitle(b), undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  return copy;
}
