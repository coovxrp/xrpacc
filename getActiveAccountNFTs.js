import WebSocket from 'ws';
import { readFile, writeFile, appendFile } from 'fs/promises';
import { join } from 'path';

const ws = new WebSocket('ws://127.0.0.1:6006'); // Adjust the WebSocket server URL as needed

async function getAccountsFromFile(filePath) {
  const data = await readFile(filePath, { encoding: 'utf8' });
  const lines = data.split('\n').filter((line) => line);
  return lines.map((line) => {
    const [account, processed] = line.split(',');
    return { account, processed: processed === 'processed' };
  });
}

async function saveAccountsToFile(accounts, filePath) {
  const data = accounts
    .map(
      ({ account, processed }) => `${account},${processed ? 'processed' : ''}`
    )
    .join('\n');
  await writeFile(filePath, data, 'utf8');
}

async function appendAccountToCSV(account, filePath) {
  await appendFile(filePath, `${account}\n`, 'utf8');
  console.log(`Appended ${account} to ${filePath}`);
}

function fetchAccountNFTs(account) {
  return new Promise((resolve, reject) => {
    ws.send(
      JSON.stringify({
        command: 'account_nfts',
        account,
        limit: 400,
        ledger_index: 'validated',
      })
    );
    ws.once('message', (data) => {
      const response = JSON.parse(data);
      if (response.status === 'success' && response.type === 'response') {
        resolve(response.result.account_nfts);
      } else if (response.error === 'actNotFound') {
        // Use resolve with a specific value to indicate account not found
        resolve('accountNotFound');
      } else {
        console.log(
          `Error fetching NFTs for account ${account}: ${
            response.error_message || 'Unknown error'
          }`
        );
        // Reject the promise for other types of errors
        reject(new Error(`Error fetching NFTs for account ${account}`));
      }
    });
  });
}

async function processAccounts(
  accounts,
  accountsFilePath,
  output300MoreFilePath,
  output300LessFilePath
) {
  let processedCount = 0;
  for (const { account, processed } of accounts) {
    if (processed) continue; // Skip already processed accounts
    try {
      const nfts = await fetchAccountNFTs(account);
      if (nfts === 'accountNotFound') {
        console.log(`${account} not found`);
        continue; // Skip this account and continue with the next one
      }
      console.log(`Processing account: ${account}, NFT count: ${nfts.length}`);
      if (nfts.length >= 300) {
        await appendAccountToCSV(account, output300MoreFilePath);
      } else if (nfts.length > 0) {
        await appendAccountToCSV(account, output300LessFilePath);
      }
      // Mark account as processed
      const index = accounts.findIndex((a) => a.account === account);
      accounts[index].processed = true;
      processedCount++;
      // Update the active accounts CSV every 100 processed accounts
      if (processedCount % 100 === 0) {
        await saveAccountsToFile(accounts, accountsFilePath);
      }
    } catch (error) {
      console.log(`Error processing account ${account}: ${error.message}`);
      // Optionally handle errors, e.g., by logging them or marking the account as errored
    }
  }
  // Final save for any remaining processed accounts
  await saveAccountsToFile(accounts, accountsFilePath);
}

ws.on('open', async () => {
  console.log('Connected to XRPL WebSocket server');
  const accountsFilePath = './4_1_24_Active_XRPL_Addresses.csv';
  const output300MoreFilePath = './4_1_24_Accounts300More.csv';
  const output300LessFilePath = './4_1_24_Accounts300Less.csv';
  const accounts = await getAccountsFromFile(accountsFilePath);
  // console.log(accounts);
  await processAccounts(
    accounts,
    accountsFilePath,
    output300MoreFilePath,
    output300LessFilePath
  );
  ws.close(); // Close the WebSocket connection after processing all accounts
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});
