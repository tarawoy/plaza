import fetch from 'node-fetch';
import { readWallets, readProxyFile } from "./utils/script.js";
import banner from "./utils/banner.js";
import log from "./utils/logger.js";
import { HttpsProxyAgent } from 'https-proxy-agent';
import performTransactions from './utils/transactions.js';

const reffCode = `bfc7b70e-66ad-4524-9bb6-733716c4da94`;
const proxyPath = 'proxy.txt';
const decimal = 1000000000000000000;

const getFaucet = async (address, proxyUrl) => {
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    const url = 'https://api.plaza.finance/faucet/queue';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-plaza-api-key': reffCode,
            },
            body: JSON.stringify({ address }),
            agent,
        });

        if (!response.ok) {
            const data = await response.json();
            log.info(`Faucet Response: ${data.message}`);
            return null;
        } else {
            log.info(`Faucet Response: Success`);
            return 'success'
        }

    } catch (error) {
        console.error('Error in Faucet request:', error);
        return null;
    }
};

const fetchUser = async (address, proxyUrl) => {
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    try {
        const response = await fetch(`https://api.plaza.finance/user?user=${address}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-plaza-api-key': reffCode,
            },
            agent,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user Status: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        log.error('Error:', error.message);
        return null;
    }
};

const claimRequest = async (address, proxyUrl) => {
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    const url = `https://api.plaza.finance/referrals/claim?address=${address}&code=JL4590xVLSix`;
    const body = {};

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-plaza-api-key': reffCode,
            },
            body: JSON.stringify(body),
            agent,
        });

        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.statusText}`);
        }

        await response.json();
    } catch (error) {
        log.error('Error in Claim request:', error);
    }
};

const fetchUserBalance = async (address, proxyUrl) => {
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    try {
        const response = await fetch(`https://api.plaza.finance/user/balances?networkId=84532&user=${address}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-plaza-api-key': reffCode,
            },
            agent,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user balance: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        log.error('Error:', error.message);
        return null;
    }
};

const main = async () => {
    log.warn(banner);
    const wallets = readWallets();
    const proxyList = readProxyFile(proxyPath);
    let index = 0;
    for (const wallet of wallets) {
        const proxy = proxyList.length > 0 ? proxyList[index % proxyList.length] : null;
        log.warn(`Running Using Proxy: ${proxy || 'No Proxy'}`);
        try {
            await claimRequest(wallet.address, proxy);

            const profile = await fetchUser(wallet.address, proxy);
            const level = profile?.level || 0;
            const points = profile?.points || 0;
            log.info(`=== Address: ${wallet.address} | Level: ${level} | Points: ${points} ===`);

            const balances = await fetchUserBalance(wallet.address, proxy);
            const balance = parseInt(balances[0]?.balanceRaw, 10) / decimal || 0;
            log.info(`=== Address: ${wallet.address} | wstETH Balance : ${balance} ===\n`);

            if (balance > 0.02) {
                log.info(`Starting Perform Transactions for address: ${wallet.address}`);
                await performTransactions(wallet.privateKey, 0);
                await performTransactions(wallet.privateKey, 1);

                log.info('Cooldowns 10 seconds before continue...\n')
                await new Promise(resolve => setTimeout(resolve, 10000));
            } else {
                log.info(`=== Not Enough wstETH, Trying to Claim Faucet ===`);
                const faucet = await getFaucet(wallet.address, proxy);
                await new Promise(resolve => setTimeout(resolve, 15000));

                if (faucet === 'success') {
                    log.info(`Starting Perform Transactions for address: ${wallet.address}`);
                    await performTransactions(wallet.privateKey, 0);
                    await performTransactions(wallet.privateKey, 1);
                    log.info('Cooldowns 10 seconds before continue...\n')
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            }
            index++;
        } catch (err) {
            console.error(err);
        }
    }
    log.warn(`This script will run every 24 hours so don't close it.\n`);
};

setInterval(main, 24 * 60 * 60 * 1000); // Run every 24 hours
main();
