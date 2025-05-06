mod seed;

fn main() {
    let mut rng = seed::Rng::new("yay".to_string());
    println!("{}", rng.next());
}
