function genValue(i) {
    // in the case of i === 8, we wastefully advance the prng
    // like in the original algorithm
    let number = Math.floor(Math.random() * 10 + i * 10);
    while (number === 0) {
        number = Math.floor(Math.random() * 10 + i * 10);
    }
    if (i === 8) {
        return Math.floor(Math.random() * 11 + 80);
    }
    return number;
}

function genIndex() {
    // wastefully advance the prng like in the original algorithm
    const magicRowIdx = 100;
    let number = Math.floor(Math.random() * 10 + magicRowIdx * 10);
    while (number === 0) {
        number = Math.floor(Math.random() * 10 + magicRowIdx * 10);
    }
    return Math.floor(Math.random() * 9);
}

function hasDuplicates(array) {
    return new Set(array).size !== array.length;
}

function genColumnSample(i) {
    let column = Array.from({ length: 3 }, () => genValue(i));
    while (hasDuplicates(column)) {
        column = Array.from({ length: 3 }, () => genValue(i));
    }
    return column.sort();
}

function genColumnIndexes() {
    let indexes = Array.from({ length: 5 }, () => genIndex());
    while (hasDuplicates(indexes) == true) {
        indexes = Array.from({ length: 5 }, () => genIndex());
    }
    return indexes.sort();
}

function containsAllIndexes(rows) {
    const values = rows.flat();
    for (let i = 0; i < 9; i++) {
        if (!values.includes(i)) {
            return false;
        }
    }
    return true;
}
function genRowIndexes() {
    let rows = [genColumnIndexes(), genColumnIndexes(), genColumnIndexes()];
    while (!containsAllIndexes(rows)) {
        rows = [genColumnIndexes(), genColumnIndexes(), genColumnIndexes()];
    }
    return rows;
}

function clearPlate() {
    for (let row = 0; row < 3; ++row) {
        for (let column = 0; column < 9; ++column) {
            const cell = `p${row}${column}`;
            document.getElementById(cell).innerHTML = "";
        }
    }
}

function genPlate(seed) {
    Math.seedrandom(seed);
    const samples = Array.from(
        { length: 9 },
        (_, idx) => genColumnSample(idx),
    );
    const indexes = genRowIndexes();
    return [samples, indexes];
}

function plateValues(seed) {
    const [samples, indexes] = genPlate(seed);
    return indexes.map((indexes, row) =>
        indexes.map((index) => samples[index][row])
    );
}

export function bench(n) {
    return Array.from({ length: n }, (_, i) => i.toString())
        .map(plateValues);
}

export function renderPlate(seed) {
    clearPlate();
    const [samples, indexes] = genPlate(seed);

    for (const row in indexes) {
        for (const index of indexes[row]) {
            const cell = `p${row}${index}`;
            const value = samples[index][row];
            document.getElementById(cell).textContent = value;
        }
    }
}
