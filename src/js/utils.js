export function sortInsert(array, item, comparer) {
    let low = 0,
        high = array.length;

    while (low < high) {
        let mid = (low + high) >>> 1;
        if (comparer(array[mid], item) <= 0) low = mid + 1;
        else high = mid;
    }
    array.splice(low, 0, item);
}