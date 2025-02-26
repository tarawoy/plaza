# PLAZA FINANCE BOT 使用默认认为知晓女巫风险 女巫风险自负！
Plaza是一个在Base上提供链上债券和杠杆的平台。

Plaza是一个在Base上构建的Solidity智能合约集，用于创建可编程衍生品。它提供两种核心产品：bondETH和levETH，这些是基于ETH流动性质押衍生品（LSTs）和流动性再质押衍生品（LRTs）如wstETH的可编程衍生品。用户可以存入基础池资产如wstETH，并接收levETH或bondETH，这些以ERC20代币形式体现。这些代币可以与DEX、借贷市场、再质押平台等协议进行组合。

![banner](image/image.png)

- 网站 [https://testnet.plaza.finance/](https://testnet.plaza.finance/rewards/0WkJP1uDWPis)
- 推特 [@plaza_finance](https://x.com/plaza_finance)

## 更新 

- `git pull` 后必须重新安装依赖：`npm install`
- 现在自动发送从一个钱包到另一个钱包，而不是从主钱包到所有钱包。

## 特性

- **每日自动交易**
- **自动获取水龙头**
- **自动生成新钱包**
- **发送资金到现有地址**
- **所有钱包信息保存在 wallets.json 中**
- **支持使用代理**


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
