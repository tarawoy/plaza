import { sendFaucet, askQuestion, readWallets } from "./utils/script.js";
import banner from "./utils/banner.js";
import log from "./utils/logger.js";

async function faucet() {
    log.warn(banner);
    log.warn(`=== This script is used for automatic fund distribution on the Base mainnet ===`);
    log.warn(`This script will distribute funds (ETH) from your main wallet to multiple wallets listed in the wallets.json file.`);
    log.warn(`Make sure your main wallet has enough ETH to cover transaction fees and the total distribution amount.`);

    const wallets = readWallets();
    if (wallets.length === 0) {
        log.error(`No wallets found in wallets.json. Please add wallets to continue.`);
        return;
    }
    log.info(`Loaded ${wallets.length} wallets from file.`);

    // Enter the faucet amount
    const faucetAmount = await askQuestion('Enter the amount of ETH to send to each wallet (e.g., 0.0003): ');
    const amount = parseFloat(faucetAmount);
    if (isNaN(amount) || amount <= 0) {
        log.error(`Invalid amount entered. Please provide a valid positive number.`);
        return;
    }
    log.info(`You chose to send ${faucetAmount} ETH to each wallet.`);

    // Ask for the private key of the sender wallet
    const pvKey = await askQuestion('Enter the private key of the wallet that holds ETH on the Base mainnet:\nThis wallet will be used for the initial transfer: ');
    if (!pvKey) {
        log.error(`No private key provided. Please provide a valid private key to continue.`);
        return;
    };
    log.info(`Private key provided. Proceeding with setup.`);

    // Confirm the total ETH to be sent
    const totalAmount = amount * wallets.length;
    log.warn(`You are about to send a total of ${totalAmount} ETH to ${wallets.length} wallets.`);
    const isConfirmed = await askQuestion(`Are you sure you want to proceed? (y/n): `);

    if (isConfirmed.toLowerCase() !== 'y') {
        log.warn(`Operation canceled by user.`);
        return;
    }

    // Start fund distribution
    log.info(`=== Beginning fund distribution ===`);
    try {
        // Send funds from the main wallet to the first wallet
        log.info(`Sending ${totalAmount} ETH from your main wallet to the first wallet (${wallets[0].address}).`);
        const sendtoWallet = await sendFaucet(totalAmount.toFixed(6).toString(), wallets[0].address, pvKey);

        if (!sendtoWallet) {
            log.error(`Failed to send funds to the first wallet.`);
            return;
        } else {
            log.info(`Successfully sent ${totalAmount} ETH to ${wallets[0].address}.`);
        }

        // Transfer funds from wallet to wallet sequentially
        for (let i = 0; i < wallets.length - 1; i++) {
            const senderWallet = wallets[i];
            const receiptWallet = wallets[i + 1];
            const amountToSend = amount * (wallets.length - (i + 1));

            log.info(`=== Transferring ${amountToSend} ETH from wallet ${senderWallet.address} to wallet ${receiptWallet.address} ===`);
            const sendToWallets = await sendFaucet(amountToSend.toFixed(6).toString(), receiptWallet.address, senderWallet.privateKey);
            if (!sendToWallets) {
                log.error(`Failed to send funds to ${receiptWallet.address}`);
                return;
            } else {
                log.info(`Successfully transferred ${amountToSend} ETH from ${senderWallet.address} to ${receiptWallet.address}.`);
            }
        }

        log.info(`=== Fund distribution complete ===`);
        log.info(`All wallets have been successfully funded!`);
    } catch (error) {
        log.error(`An error occurred during the operation: ${error.message}`);
    }
}

faucet();
