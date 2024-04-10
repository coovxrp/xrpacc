import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { writeFile } from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// To handle __dirname in ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputCsvPath = path.join(__dirname, 'unique-owners.csv');
const outputCsvPath = path.join(__dirname, '300.csv');

async function filterAndSaveOwners() {
  try {
    // Read the CSV file
    const csvContent = fs.readFileSync(inputCsvPath, 'utf8');
    // Parse the CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Filter records for owners with 300 or more NFTs
    const filteredRecords = records.filter(
      (record) => parseInt(record.totalNFTs, 10) >= 300
    );

    // Stringify the filtered records to CSV format
    const csvOutput = stringify(filteredRecords, {
      header: true,
      columns: ['owner', 'totalNFTs'],
    });

    // Save the filtered list to a new CSV file
    await writeFile(outputCsvPath, csvOutput, 'utf8');
    console.log('Filtered CSV saved successfully.');
  } catch (error) {
    console.error('Error processing CSV:', error);
  }
}

filterAndSaveOwners();
