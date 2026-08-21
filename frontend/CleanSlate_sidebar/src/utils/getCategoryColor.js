const categoryColors = [
    "var(--color-glow-blue)",
    "var(--color-glow-green)",
    "var(--color-glow-yellow)",
    "#d66ec2", // Magenta
    "#a78bfa", // Purple
    "#22d3ee", // Cyan
    "#fb923c", // Orange
];
const knownCategoryColors = {
    education: "var(--color-glow-green)",
    educational: "var(--color-glow-green)",
    promotions: "var(--color-glow-yellow)",
    newsletters: "var(--color-glow-blue)",
    social: "#d66ec2",
    "low priority": "#9aa0a6",
};

function getCategoryColor(label = "") {
    const normalizedLabel = String(label)
        .trim()
        .toLowerCase()
        .replace(/[-_]+/g, " ");

    const knownColor = knownCategoryColors[normalizedLabel];

    if (knownColor) {
        return knownColor;
    }
    let labelHash = 0;

    for (const character of normalizedLabel) {
        labelHash =
            (labelHash * 31 + character.charCodeAt(0)) >>> 0;
    }

    const colorIndex = labelHash % categoryColors.length;

    return categoryColors[colorIndex];
}

export default getCategoryColor;