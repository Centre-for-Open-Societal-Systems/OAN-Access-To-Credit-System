const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/mocks/leads.mock.ts');
let content = fs.readFileSync(filePath, 'utf8');

// List of realistic names
const names = [
  'Abebe Kebede', 'Sara Bekele', 'John Doe', 'Jane Smith', 
  'Mohammed Ali', 'Fatima Nur', 'David Chen', 'Maria Garcia',
  'Tadesse Mengistu', 'Aster Awoke', 'Hassan Ibrahim', 'Amira Said'
];

let counter = 0;
// We need to match the object literals in the array.
// A regex to match each object in the leadRows array.
const newContent = content.replace(/\{ id: '([^']+)',([^}]+)\}/g, (match, id, rest) => {
  const name = names[counter % names.length];
  const farmerId = 'FID-' + Math.floor(1000000 + Math.random() * 9000000);
  const consentDate = 'May ' + (10 + Math.floor(Math.random() * 20)) + ', 2026';
  counter++;
  
  // If farmerName is already there, don't add it again
  if (rest.includes('farmerName:')) return match;

  return `{ id: '${id}', farmerName: '${name}', farmerId: '${farmerId}', consentDate: '${consentDate}',${rest}}`;
});

fs.writeFileSync(filePath, newContent);
console.log('Mock data updated successfully.');
