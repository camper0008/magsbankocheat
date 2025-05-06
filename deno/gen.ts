import { randomSeed } from "./seedrandom.ts";

export type Plate = number[][];

function genValue(i: number) {
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

function hasDuplicates(array: number[]) {
    return new Set(array).size !== array.length;
}

function genColumnSample(i: number) {
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

function containsAllIndexes(rows: number[][]) {
    const values = rows.flat();
    for (let i = 0; i < 9; i++) {
        if (!values.includes(i)) {
            return false;
        }
    }
    return true;
}
function genRowIndexes() {
    let rows = Array.from({ length: 3 }, () => genColumnIndexes());
    while (!containsAllIndexes(rows)) {
        rows = Array.from({ length: 3 }, () => genColumnIndexes());
    }
    return rows;
}

function genPlate(seed: string) {
    randomSeed(seed);
    const samples = Array.from(
        { length: 9 },
        (_, idx) => genColumnSample(idx),
    );
    const indexes = genRowIndexes();
    return [samples, indexes];
}

function plateValues(seed: string) {
    const [samples, indexes] = genPlate(seed);
    return indexes.map((indexes, row) =>
        indexes.map((index) => samples[index][row])
    );
}

export function genBatchPlates(count: number, offset = 0): [number, Plate][] {
    const result: [number, Plate][] = [];
    for (let i = 0; i < count; ++i) {
        if ((i + 1) % (count / 10) === 0) {
            const amountDone = ((i + 1) / count) * 100;
            console.log(`${amountDone}%`);
        }
        const value = i + offset;
        result.push([value, plateValues(value.toString())]);
    }
    return result;
}
