import axios from 'axios';
import { readFile, appendFile, writeFile } from 'fs/promises';
import { join } from 'path';

const participatingIssuers = [
  'rLULtFuV1agdSQdVmSd7AYx2cfEiN6noxY', //pixel astros rLULtFuV1agdSQdVmSd7AYx2cfEiN6noxY
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

const getOwnersAPI = 'https://bithomp.com/api/v2/nft-count/'; //'https://api.xrpscan.com/api/v1/nft/owners';
const accessToken = '74f27e9e-af03-44c9-bc23-552cf993323d'; //compromised(pushed to github);

async function fetchAndSaveIssuerData(issuer) {
  try {
    const response = await axios.get(`${getOwnersAPI}${issuer}?list=owners`, {
      headers: {
        'x-bithomp-token': accessToken,
      },
    });
    const data = response.data;
    await saveDataAsJSON(data, `./data_${issuer}.json`); // Save each issuer's data as a JSON file
    return data.owners || [];
  } catch (error) {
    console.error(`Error fetching owners for issuer ${issuer}:`, error);
    return [];
  }
}

async function saveDataAsJSON(data, filePath) {
  try {
    await writeFile(
      join(process.cwd(), filePath),
      JSON.stringify(data, null, 2),
      'utf8'
    );
    console.log(`Saved data to ${filePath}`);
  } catch (error) {
    console.error('Error saving JSON data:', error);
  }
}

function sleep(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

async function aggregateOwnerData() {
  let ownerData = {};

  for (const issuer of participatingIssuers) {
    const owners = await fetchAndSaveIssuerData(issuer);
    // Aggregate owner data
    owners.forEach((owner) => {
      const { account, quantity } = owner; // Assuming the response includes these fields for each owner
      if (!ownerData[account]) {
        ownerData[account] = {};
      }
      ownerData[account][issuer] = quantity;
    });
    console.log('Sleeping for 7 seconds...');
    await sleep(7000); // Respect API rate limits
    console.log('Continuing with the next issuer.');
  }

  await saveDataAsJSON(ownerData, './aggregate_owner_data.json'); // Save the aggregated owner data as a JSON file
}

aggregateOwnerData();
