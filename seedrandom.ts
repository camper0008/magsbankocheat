// (tph): deobfuscated seedrandom.js
//        a lot of the cruft has been cut out, as it doesn't apply to our cases
//        i.e. stuff related to backwards compatibility, or unseeded input, or non-string seeds

const width = 256; // width: each RC4 output is 0 <= x < 256
const chunks = 6; // chunks: at least six RC4 outputs for each double
const digits = 52; // digits: there are 52 significant digits in a double

//
// The following constants are related to IEEE 754 limits.
//
const startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;

export function randomSeed(seed: string) {
    const key: number[] = [];

    mixkey(
        seed,
        key,
    );

    // Use the seed to initialize an ARC4 generator.
    const arc4 = new ARC4(key);

    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.
    function prng() {
        let n = arc4.g(chunks); // Start with a numerator n < 2 ^ 48
        let d = startdenom; // and denominator d = 2 ^ 48.
        let x = 0; // and no 'extra last byte'.
        while (n < significance) {
            // Fill up all significant digits by
            n = (n + x) * width; //   shifting numerator and
            d *= width; //   denominator and generating a
            x = arc4.g(1); //   new least-significant-byte.
        }
        while (n >= overflow) {
            // To avoid rounding up, before adding
            n /= 2; //   last byte, shift everything
            d /= 2; //   right using integer math until
            x >>>= 1; //   we have exactly the desired bits.
        }
        return (n + x) / d; // Form the number within [0, 1).
    }

    Math["random"] = prng;
}

// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
// (tph): not arc4, name collision. narc is a fun word. stikker.
class ARC4 {
    private i = 0;
    private j = 0;
    private S: number[] = [];

    constructor(key: number[]) {
        let t;
        let i = 0;
        let j = 0;
        let keylen = key.length;
        // The empty key [] is treated as [0].
        if (!keylen) {
            key = [keylen++];
        }

        while (i < width) {
            this.S[i] = i++;
        }
        for (i = 0; i < width; ++i) {
            this.S[i] =
                this.S[j = mask & (j + key[i % keylen] + (t = this.S[i]))];
            this.S[j] = t;
        }

        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
        this.g(width);
    }

    public g(count: number) {
        // Using instance members instead of closure state nearly doubles speed.
        const s = this.S;
        let t,
            r = 0,
            i = this.i,
            j = this.j;
        while (count--) {
            t = s[i = mask & (i + 1)];
            r = r * width +
                s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
        }
        this.i = i;
        this.j = j;
        return r;
    }
}

// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
// (tph): i don't understand this function enough to say it isn't required, as i know it modifies key
// (tph): the return value is useless to us. it's "shortseed",
//        which is what Math.randomseed returns if called as "Math.randomseed"
//        but MAGS discards the return value
// (tph): from my testing, it appears to fill key with the seed converted to charcodes
//        so it's functionally the same as the following, for our use cases

function mixkey(seed: string, key: number[]): void {
    for (let i = 0; i < seed.length; ++i) {
        key[i] = seed.charCodeAt(i);
    }
    return;

    /*
    // (tph): possibly a global
    var smear: number;

    const stringseed = seed + "";
    let j = 0;
    while (j < stringseed.length) {
        key[mask & j] = mask &
            ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
    }

    // (tph): used to be called "tostring", inlined
    return String.fromCharCode(...key);
    */
}
