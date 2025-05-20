# backend
The backend of AliceAi

## Setup and Installation

### Prerequisites
- Rust (stable version, 1.70.0 or higher recommended)
- Cargo (comes with Rust)
- PostgreSQL (optional, if your backend uses a database)

### Installing Dependencies
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone the repository
git clone https://github.com/alice2025ai/alice_ai_server.git
cd alice_ai_server

# Install additional dependencies (if any specific tools are needed)
# cargo install diesel_cli (example for database migrations)
```

## Building the Project
```bash
# Build the project in debug mode
cargo build

# Build for production (optimized)
cargo build --release
```

## Running the Application
```bash
# Run in development mode
cargo run

# Run with specific features
cargo run --features feature_name

# Run the optimized release version
cargo run --release
```

## Testing
```bash
# Run all tests
cargo test

# Run specific tests
cargo test test_name

# Run tests with verbose output
cargo test -- --nocapture
```

## Documentation
Generate and view the documentation:
```bash
# Generate documentation
cargo doc --open
```
```