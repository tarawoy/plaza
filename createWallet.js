import { ethers } from 'ethers';
import fs from 'fs';
import { askQuestion } from "./utils/script.js";
import log from "./utils/logger.js";
import banner from "./utils/banner.js";

// Function to create a new wallet
function createNewWallet() {
    const wallet = ethers.Wallet.createRandom();

    const walletDetails = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
    };

    // Log wallet details
    log.info("Created a new Ethereum wallet:");
    log.info(`Address: ${walletDetails.address}`);
    log.info(`Private Key: ${walletDetails.privateKey}`);
    log.info(`Mnemonic: ${walletDetails.mnemonic}`);

    return walletDetails;
}

// Function to save wallet to a file
function saveWalletToFile(walletDetails) {
    let wallets = [];
    if (fs.existsSync("wallets.json")) {
        const data = fs.readFileSync("wallets.json");
        wallets = JSON.parse(data);
    }

    wallets.push(walletDetails);

    fs.writeFileSync("wallets.json", JSON.stringify(wallets, null, 2));

    log.warn("Wallet has been saved to wallets.json");
}

async function askHowManyWallets() {
    const answer = await askQuestion('How many wallets would you like to create? ');
    return parseInt(answer);
}

// Main function
async function main() {
    log.warn(banner);
    const numWallets = await askHowManyWallets();
    for (let i = 0; i < numWallets; i++) {
        log.info(`Creating wallet #${i + 1}...`);

        const newWallet = createNewWallet();
        saveWalletToFile(newWallet);
    }

    log.info("All wallets have been created.");
}

// Run the script
main();
