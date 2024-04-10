import WebSocket from 'ws';
import axios from 'axios';
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
  'rGNuFE4e2c5NwEp2HnuiJqaSVdaNYRQ7PV', //astronaughties
];
const getOwnersAPI = ' https://bithomp.com/api/v2/nft-count/'; //'https://api.xrpscan.com/api/v1/nft/owners';

async function fetchOwners(issuer) {
  try {
    const response = await axios.get(`${getOwnersAPI}${issuer}`);
    // Assuming the API response structure has a field that contains the list of owners
    // console.log(response);
    return response.data.owners || [];
  } catch (error) {
    console.error(`Error fetching owners for issuer ${issuer}:`, error);
    return [];
  }
}

async function saveOwnersToCSV(owners, filePath) {
  const csvRows = owners.map((owner) => `${owner}\n`).join('');
  try {
    await appendFile(join(process.cwd(), filePath), csvRows, 'utf8');
    console.log(`Saved owners to ${filePath}`);
  } catch (error) {
    console.error('Error saving to CSV:', error);
  }
}
function sleep(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
(async () => {
  let allOwners = new Set();

  for (const issuer of participatingIssuers) {
    const owners = await fetchOwners(issuer);
    owners.forEach((owner) => allOwners.add(owner));
    console.log('sleep');
    await sleep(7000);
    console.log('wake');
  }

  const uniqueOwners = [...allOwners];
  await saveOwnersToCSV(uniqueOwners, './unique-owners.csv');
})();
