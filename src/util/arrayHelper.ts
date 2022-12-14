export function moveArrayItem(
  array: any[],
  fromIndex: number,
  toIndex: number,
) {
  const arr = [...array]
  arr.splice(toIndex, 0, ...arr.splice(fromIndex, 1))
  return arr
}
