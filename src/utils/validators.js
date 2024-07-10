
// JS has too many quirks with NaN... I'm not going to reinvent the wheel with an infamously painful JS problem
// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
// Tested with edge cases, works fine too.
export function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}