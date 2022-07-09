export const firstLetterUpperCase = (s: string) => {
    if (s === "leroymerlin") {
        return "Leroy Merlin"
    }
    return s.split(" ")
        .map((substring: string) => substring[0].toUpperCase() + substring.slice(1))
        .join(" ")
}
