import { Board, genBatchBoards } from "./gen.ts";

function genBoards(count: number): [number, Board][] {
    const then = Date.now();
    const value: [number, Board][] = genBatchBoards(count);
    const now = Date.now();
    console.log(`created ${count} boards in ${now - then}ms`);
    return value;
}

function promptInt(message: string): number {
    return parseInt(prompt(message)?.replaceAll("_", "") ?? "");
}

function work(count: number): void {
    const boards = genBoards(count);
    const draws = new Set<number>();
    const winners = new Map<number, number>();
    while (true) {
        console.log("currently drawn:", ...draws.values());
        const drawn = promptInt("newest draw?");
        draws.add(drawn);
        if (draws.size < 5) {
            continue;
        }
        for (const [seed, board] of boards) {
            const amount = board.filter(
                (row) => row.every((value) => draws.has(value)),
            ).length;
            if (amount > 0 && winners.get(seed) !== amount) {
                winners.set(seed, amount);
                console.log("seed", seed, "has", amount, "rows");
            }
        }
    }
}

if (import.meta.main) {
    const count = promptInt("how many?");
    work(count);
}
