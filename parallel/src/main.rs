use std::{collections::HashSet, time::Instant};

use rayon::iter::{IntoParallelIterator, ParallelIterator};
use seed::Rng;

mod seed;

fn gen_column_sample(rng: &mut Rng, idx: usize) -> [usize; 3] {
    let mut indexes = std::array::from_fn(|_| gen_value(rng, idx));
    while has_duplicates(indexes) {
        indexes = std::array::from_fn(|_| gen_value(rng, idx));
    }
    indexes.sort();
    indexes
}

fn has_duplicates<const N: usize>(array: [usize; N]) -> bool {
    HashSet::from(array).len() != array.len()
}

fn gen_value(rng: &mut Rng, i: usize) -> usize {
    let mut number = (rng.next() * 10.0 + i as f64 * 10.0).floor() as usize;
    while number == 0 {
        number = (rng.next() * 10.0 + i as f64 * 10.0).floor() as usize;
    }
    if i == 8 {
        return (rng.next() * 11.0 + 80.0).floor() as usize;
    }
    number
}

fn gen_index(rng: &mut Rng) -> usize {
    const MAGIC_ROW_IDX: f64 = 100.0;
    let mut number = (rng.next() * 10.0 + MAGIC_ROW_IDX * 10.0).floor() as usize;
    while number == 0 {
        number = (rng.next() * 10.0 + MAGIC_ROW_IDX * 10.0).floor() as usize;
    }
    (rng.next() * 9.0).floor() as usize
}

fn gen_column_indexes(rng: &mut Rng) -> [usize; 5] {
    let mut indexes = std::array::from_fn(|_| gen_index(rng));
    while has_duplicates(indexes) {
        indexes = std::array::from_fn(|_| gen_index(rng));
    }
    indexes.sort();
    indexes
}

fn gen_row_indexes(rng: &mut Rng) -> [[usize; 5]; 3] {
    let mut rows = std::array::from_fn(|_| gen_column_indexes(rng));
    while !contains_all_indexes(rows) {
        rows = std::array::from_fn(|_| gen_column_indexes(rng));
    }
    rows
}

fn contains_all_indexes(rows: [[usize; 5]; 3]) -> bool {
    let rows = rows.concat();
    for i in 0..9 {
        if !rows.contains(&i) {
            return false;
        }
    }
    true
}

fn board<S: AsRef<str>>(seed: S) -> [[usize; 5]; 3] {
    let mut rng = seed::Rng::new(seed.as_ref().bytes().collect());
    let samples: Vec<_> = (0..9).map(|i| gen_column_sample(&mut rng, i)).collect();
    let indexes = gen_row_indexes(&mut rng);
    indexes
        .iter()
        .enumerate()
        .map(|(row, indexes)| indexes.map(|index| samples[index][row]))
        .collect::<Vec<_>>()
        .try_into()
        .unwrap()
}

fn main() {
    let boards = 1_000_000;
    let then = Instant::now();
    let boards: Vec<_> = (0..boards)
        .into_par_iter()
        .map(|i| i.to_string())
        .map(board)
        .collect();
    let took = Instant::now() - then;
    println!("created {} boards in {}ms", boards.len(), took.as_millis());
}
