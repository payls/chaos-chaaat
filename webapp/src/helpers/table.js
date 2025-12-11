/**
 * Default filter method for react-table
 * @param {{pivotId?:string, id?:string, value?:string}} filter
 * @param {object} row
 * @param {object} column
 * @returns {boolean}
 */
export function defaultFilterMethod(filter, row, column) {
  const id = filter.pivotId || filter.id;
  return row[id] !== undefined
    ? String(row[id]).toLowerCase().indexOf(filter.value.toLowerCase()) > -1
    : true;
}
