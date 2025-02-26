import { ethers } from 'ethers';
import { askQuestion, readWallets } from "./utils/script.js";
import banner from "./utils/banner.js";
import log from "./utils/logger.js";

async function sendFaucet(faucetAmount, addressRecipient, pvkey) {
    log.info(`Sending faucet ${faucetAmount} to address ${addressRecipient}`);
    try {
        const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
        const wallet = new ethers.Wallet(pvkey, provider);
        const feeData = await provider.getFeeData();

        const tx = {
            to: addressRecipient,
            value: ethers.parseEther(faucetAmount),
            gasLimit: 21000,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || feeData.gasPrice,
            maxFeePerGas: feeData.maxFeePerGas || feeData.gasPrice
        };

        const txResponse = await wallet.sendTransaction(tx);
        log.info(`Transaction sent to ${addressRecipient}: https://sepolia.basescan.org/tx/${txResponse.hash}`);

        await txResponse.wait();
        return txResponse.hash;
    } catch (error) {
        log.error("Error occurred while sending faucet:", error);
        return null;
    }
}

async function faucet() {
    log.warn(banner);
    log.warn(`=== This script is for the Base Sepolia test network ===`);
    log.warn(`This script will distribute (ETH) test network tokens to wallets listed in the wallets.json file.`);

    const wallets = readWallets();
    if (wallets.length === 0) {
        log.error(`No wallets found in wallets.json. Please add wallets to continue.`);
        return;
    }
    log.info(`Loaded ${wallets.length} wallets from the file.`);

    // Input faucet amount
    const faucetAmount = await askQuestion('Please enter the amount of ETH to send to each wallet (e.g., 0.001): ');
    const amount = parseFloat(faucetAmount);
    if (isNaN(amount) || amount <= 0) {
        log.error(`Invalid amount entered. Please provide a valid positive number.`);
        return;
    }
    log.info(`You chose to send ${faucetAmount} ETH to each wallet.`);

    // Ask for sender wallet's private key
    const pvKey = await askQuestion('Enter the private key of the wallet holding ETH on the Base Sepolia test network:\nThis wallet will be used for the initial transaction: ');
    if (!pvKey) {
        log.error(`Private key not provided. Please provide a valid private key to continue.`);
        return;
    }
    log.info(`Private key provided. Proceeding with setup.`);

    // Confirm the total ETH amount to be sent
    const totalAmount = amount * wallets.length;
    log.warn(`You are about to send a total of ${totalAmount} ETH to ${wallets.length} wallets.`);
    const isConfirmed = await askQuestion(`Are you sure you want to proceed? (y/n): `);

    if (isConfirmed.toLowerCase() !== 'y') {
        log.warn(`Operation canceled by user.`);
        return;
    }

    // Start sending funds
    log.info(`=== Starting to distribute funds ===`);
    try {
        // Use the main private key to send funds to the first wallet
        log.info(`Sending ${totalAmount} ETH from your main wallet to the first wallet (${wallets[0].address}).`);
        const sendtoWallet = await sendFaucet(totalAmount.toFixed(6).toString(), wallets[0].address, pvKey);

        if (!sendtoWallet) {
            log.error(`Failed to send funds to the first wallet`);
            return;
        } else {
            log.info(`Successfully sent ${totalAmount} ETH to ${wallets[0].address}.`);
        }

        // Transfer funds to other wallets
        for (let i = 0; i < wallets.length - 1; i++) {
            const senderWallet = wallets[i];
            const receiptWallet = wallets[i + 1];
            const amountToSend = amount * (wallets.length - (i + 1));

            log.info(`=== Sending ${amountToSend} ETH from wallet ${senderWallet.address} to wallet ${receiptWallet.address} ===`);
            const sendToWallets = await sendFaucet(amountToSend.toFixed(6).toString(), receiptWallet.address, senderWallet.privateKey);
            if (!sendToWallets) {
                log.error(`Failed to send funds to ${receiptWallet.address}`);
                return;
            } else {
                log.info(`Successfully transferred ${amountToSend} ETH from ${senderWallet.address} to ${receiptWallet.address}.`);
            }
        }

        log.info(`=== Fund distribution completed ===`);
        log.info(`All wallets have been successfully funded!`);
    } catch (error) {
        log.error(`Error occurred during operation: ${error.message}`);
    }
}

faucet();
