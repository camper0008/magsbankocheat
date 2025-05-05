import { genBatchPlates } from "./gen.js";

if (import.meta.main) {
    const count = parseInt(prompt("how many?").trim());
    const then = Date.now();
    genBatchPlates(count);
    const now = Date.now();

    console.log(`created ${count} plates in ${now - then}ms`);
}
