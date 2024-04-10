import WebSocket from 'ws';
import { appendFile } from 'fs/promises';
import { join } from 'path';

const participatingIssuers = [
  'rLULtFuV1agdSQdVmSd7AYx2cfEiN6noxY', //pixel astros
  'rMQw4pe2eXvs6b5hKLNM2MCgVqHEHwXBkJ', //astronaughties
  'rJkJAujK2W4Kzrz9JEWtcXHcTt7iTaJ2f2', //MMA OG minter
  'rDDPTdg9exZGybHcBjHWNeA2vw8scpiiCX', //TGA
  'rJDbbrHXLbU86VbxknbiRzgD3UXuah7yYj', //Dom
  'r3c4wuWCN95ahyERjbzNxYKAPyAN2MonEy', //Mutants
  'rNQdGWRCpY5PFbkR5ebkZ7fRHpKNcp4RXQ', //xparrots
  'rHaDANFTy4HQRqyEcL8qNKCdQ5xik8mhq4', //hada
  'rGex8yPAMhWf9r51AMWjWZtnELxY5xs1fP', //tds mini digis
  'rhbzVvcLf1qzLr8du4QVRqtp7QiF92WtvA', //tds genesis
  'rN2LBDYYzG3zDfFzKFUEdDsT9o7fZNdSEc', //lamboxapes.art
  'rw6ePtXv6zLUjRiD7fvsc7YdsQNi3pwuHY', //lamboxapes.art2
  'rpgGBHg5tV2uPqXr8SKjdD1ZM6w9ou6XNP', //xclowns
  'rncidPnbDNrJ3dnSVSr6WH35RS2pqN3b1M', //qwaken
  'raaorpu59mgUoi4sKT7BVGsxJQeDPG4zki', //theripplers
  'rKd9seqW1cuSjH8dgZpxjwXMbDwkaRPUNK', //legion of degen
  'rKgR5LMCU1opzENpP7Qz7bRsQB4MKPpJb4', //rude boy
  'raWYT6DD2XFAvjCqRPsCCzr1CMBzJydf9E', //RBCHQ
];
// Connect to a public XRPL WebSocket server
const ws = new WebSocket('ws://127.0.0.1:6006');

async function appendActiveAccountToCSV(account, balance, filePath) {
  const csvRow = `${account},${balance}\n`;
  try {
    await appendFile(join(process.cwd(), filePath), csvRow, 'utf8');
    console.log(`Appended ${account} to ${filePath}`);
  } catch (error) {
    console.error('Error appending to CSV:', error);
  }
}
ws.on('open', function open() {
  console.log('Connected to XRPL WebSocket server');

  // Send a ledger_data request
  ws.send(
    JSON.stringify({
      id: 1,
      command: 'ledger_data',
      ledger_index: 'validated',
      // limit: 5, // Adjust limit as needed
      binary: false, // Set to false to get JSON objects instead of binary
    })
  );
});

ws.on('message', async function incoming(data) {
  console.log('Received data from XRPL WebSocket server');
  const response = JSON.parse(data);

  if (
    response.type === 'response' &&
    response.result &&
    response.result.state
  ) {
    // Process ledger entries here
    for (const entry of response.result.state) {
      // Check if the entry is an account root object (which contains XRP balance)
      if (entry.LedgerEntryType === 'AccountRoot') {
        const xrpBalance = entry.Balance / 1000000; // Convert from drops to XRP
        const account = entry.Account;

        if (xrpBalance >= 30) {
          console.log(
            `Active account: ${account} with balance: ${xrpBalance} XRP`
          );
          await appendActiveAccountToCSV(
            account,
            xrpBalance,
            './4_3_24_Active_XRPL_Addresses.csv'
          );
        }
      }
    }

    // Check for pagination marker and send another request if present
    if (response.result.marker) {
      console.log('Paginating for more data');
      ws.send(
        JSON.stringify({
          id: 2,
          command: 'ledger_data',
          ledger_index: 'validated',
          binary: false, // Set to false to get JSON objects instead of binary
          marker: response.result.marker, // Use marker for pagination
        })
      );
    }
  } else {
    console.log('No more data to paginate. Closing connection.');
    ws.close();
  }
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});
