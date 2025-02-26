

## Requirements

- **Node.js**: Ensure Node.js is installed.
- **npm**: Ensure npm is installed.
- **Wallets must have $1 on the eth/base/arb mainnet to receive the faucet.**
- **Use the auto-send feature to send funds to existing wallets**: Each address sends `0.00031` eth (greater than 1u).

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/Gzgod/plaza.git
   cd plaza
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup: Create a new wallet
   ```bash
   npm run create
   ```

4. Additional Features:

- Send funds to an existing address:
    ```bash
    npm run autosend
    ```

- Use a proxy (optional): Paste the proxy into the `proxy.txt` file. One proxy per line.
    ```bash
    nano proxy.txt
    ```
    Format: `http://user:password@ip:port`

5. Run the script:
   ```bash
   npm run start
   ```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).
