const WIDTH: usize = 256; // each rc4 output is 0 <= x < 256
const CHUNKS: usize = 6; // at least six rc4 outputs for each double
const DIGITS: usize = 52; // there are 52 significant digits in a f64

const START_DENOM: usize = (WIDTH).pow(CHUNKS as u32);
const SIGNIFICANCE: usize = 2_usize.pow(DIGITS as u32);
const OVERFLOW: usize = SIGNIFICANCE * 2;
const MASK: usize = WIDTH - 1;

struct Arc4 {
    i: usize,
    j: usize,
    s: Vec<usize>,
}

pub struct Rng {
    arc: Arc4,
}

impl Arc4 {
    fn initialize_s(key: Vec<u8>) -> Vec<usize> {
        let mut t;
        let mut j = 0;
        let keylen = key.len();
        let mut s = Vec::new();

        for i in 0..WIDTH {
            s.push(i);
        }
        for i in 0..WIDTH {
            t = s[i];
            j = (j + key[i % keylen] as usize + t) & MASK;
            s[i] = s[j];
            s[j] = t;
        }
        s
    }
    fn new(key: Vec<u8>) -> Self {
        let mut v = Self {
            i: 0,
            j: 0,
            s: Self::initialize_s(key),
        };
        v.g(WIDTH);
        v
    }
    fn g(&mut self, count: usize) -> f64 {
        let mut t;
        let mut r: f64 = 0.0;
        for _ in (0..count).rev() {
            self.i = MASK & (self.i + 1);
            t = self.s[self.i];
            self.j = MASK & (self.j + t);
            self.s[self.i] = self.s[self.j];
            self.s[self.j] = t;
            let temp = MASK & (self.s[self.i] + self.s[self.j]);
            r = r * WIDTH as f64 + self.s[temp] as f64;
        }
        r
    }
}

impl Rng {
    pub fn new(seed: Vec<u8>) -> Self {
        Self {
            arc: Arc4::new(seed),
        }
    }
    pub fn next(&mut self) -> f64 {
        let mut n = self.arc.g(CHUNKS) as usize;
        let mut d = START_DENOM as f64;
        let mut x = 0;
        while n < SIGNIFICANCE {
            n = (n + x) * WIDTH;
            d *= WIDTH as f64;
            x = self.arc.g(1) as usize;
        }
        while n >= OVERFLOW {
            n /= 2;
            d /= 2.0;
            x >>= 1;
        }
        (n + x) as f64 / d as f64
    }
}
