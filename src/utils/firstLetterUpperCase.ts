export const firstLetterUpperCase = (string: string) => {
    if (string === "leroymerlin") {
        return "Leroy Merlin"
    }
    return string.split(" ")
        .map((substring: string) => substring[0].toUpperCase() + substring.slice(1))
        .join(" ")
}
