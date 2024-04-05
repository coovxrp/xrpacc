import WebSocket from 'ws';
import { readFile, writeFile, appendFile } from 'fs/promises';
import { join } from 'path';

const network = 'wss://s1.ripple.com'; // Adjust as needed
const accountsFilePath = './4_3_24_Accounts300More.csv';
const recipientsFilePath = './recipients.csv';

// Function to fetch all NFTs owned by an account, excluding self-issued NFTs
async function fetchAllNFTs(account) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(network);
    let allNFTs = [];

    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          command: 'account_nfts',
          account: account,
          limit: 400,
        })
      );
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data);

      if (response.status === 'error') {
        console.error(
          `Error fetching NFTs for account ${account}:`,
          response.error_message
        );
        ws.close();
        reject(response.error_message);
        return;
      }

      allNFTs = allNFTs.concat(
        response.result.account_nfts.filter((nft) => nft.Issuer !== account)
      );

      if (response.result.marker) {
        ws.send(
          JSON.stringify({
            command: 'account_nfts',
            account: account,
            limit: 400,
            marker: response.result.marker,
          })
        );
      } else {
        ws.close();
        resolve(allNFTs);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
      reject(err);
    });
  });
}

async function processAccounts() {
  const accountsData = await readFile(accountsFilePath, { encoding: 'utf8' });
  const accounts = accountsData.split('\n').filter((line) => line);

  for (const account of accounts) {
    const nfts = await fetchAllNFTs(account);
    if (nfts.length >= 300) {
      await appendAccountToCSV(account, recipientsFilePath);
    }
  }
}

async function appendAccountToCSV(account, filePath) {
  await appendFile(filePath, `${account}\n`);
  console.log(`Appended ${account} to ${filePath}`);
}

processAccounts().catch(console.error);
