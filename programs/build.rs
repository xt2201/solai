use std::fs;
use std::path::PathBuf;

use serde::Deserialize;

#[derive(Deserialize)]
struct Config {
    solana: Solana,
}

#[derive(Deserialize)]
struct Solana {
    program: Program,
}

#[derive(Deserialize)]
struct Program {
    id: String,
}

fn main() {
    let manifest_dir = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR set"));
    let config_path = manifest_dir
        .parent()
        .expect("programs has parent")
        .join("config.yml");

    let raw = fs::read_to_string(&config_path)
        .unwrap_or_else(|err| panic!("failed to read config {:?}: {}", config_path, err));
    let config: Config = serde_yaml::from_str(&raw).expect("config.yml must be valid YAML");
    println!("cargo:rustc-env=SOLAI_PROGRAM_ID={}", config.solana.program.id);
}
