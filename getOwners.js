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
const accessToken = '74f27e9e-af03-44c9-bc23-552cf993323d';

async function readAndParseJSON(filePath) {
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading or parsing JSON file ${filePath}:`, error);
    return null;
  }
}

async function aggregateOwnerData() {
  let allOwners = {};

  for (const issuer of participatingIssuers) {
    const data = await readAndParseJSON(`./data_${issuer}.json`);
    if (data && data.owners) {
      data.owners.forEach(({ owner, count }) => {
        if (!allOwners[owner]) {
          allOwners[owner] = [];
        }
        allOwners[owner].push({ issuer, count });
      });
    }
  }

  return allOwners;
}

async function saveOwnersData(owners) {
  const rows = ['owner,issuer,count\n']; // CSV header
  for (const [owner, issuers] of Object.entries(owners)) {
    issuers.forEach(({ issuer, count }) => {
      rows.push(`${owner},${issuer},${count}\n`);
    });
  }
  await writeFile('./owners_data.csv', rows.join(''), 'utf8');
}

async function summarizeAndSaveUniqueOwners(owners) {
  const uniqueOwners = {};

  // Summarize total NFTs per owner
  Object.entries(owners).forEach(([owner, details]) => {
    const totalNFTs = details.reduce((sum, { count }) => sum + count, 0);
    uniqueOwners[owner] = totalNFTs;
  });

  // Save to CSV
  const rows = ['owner,totalNFTs\n'];
  Object.entries(uniqueOwners).forEach(([owner, totalNFTs]) => {
    rows.push(`${owner},${totalNFTs}\n`);
  });
  await writeFile('./unique-owners.csv', rows.join(''), 'utf8');
}

async function processOwnerData() {
  const aggregatedData = await aggregateOwnerData();
  await saveOwnersData(aggregatedData);
  await summarizeAndSaveUniqueOwners(aggregatedData);
  console.log('Owner data processing complete.');
}

processOwnerData();
