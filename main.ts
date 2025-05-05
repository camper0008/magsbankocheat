import { genBatchPlates } from "./gen.js";

type Plate = [number, number[][]];

function genPlates(count: number): Plate[] {
    const then = Date.now();
    const value = genBatchPlates(count);
    const now = Date.now();
    console.log(`created ${count} plates in ${now - then}ms`);
    return value;
}

function promptInt(message: string): number {
    return parseInt(prompt(message)?.replaceAll("_", "") ?? "");
}

function work(count: number): void {
    const plates = genPlates(count);
    const draws = new Set<number>();
    const winners = new Map<number, number>();
    while (true) {
        const drawn = promptInt("now drawn?");
        draws.add(drawn);
        if (draws.size < 5) {
            continue;
        }
        for (const [seed, plate] of plates) {
            const amount = plate.filter(
                (row) => row.every((value) => draws.has(value)),
            ).length;
            if (amount > 0) {
                winners.set(seed, amount);
            }
        }
        for (const [seed, rows] of winners) {
            console.log("seed", seed, "has", rows, "rows");
        }
    }
}

if (import.meta.main) {
    const count = promptInt("how many?");
    work(count);
}
