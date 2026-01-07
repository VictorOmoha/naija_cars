const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function extractDocx(filename) {
  const filepath = path.join(__dirname, filename);
  try {
    const result = await mammoth.extractRawText({ path: filepath });
    console.log(`\n${'='.repeat(80)}`);
    console.log(`FILE: ${filename}`);
    console.log('='.repeat(80));
    console.log(result.value);
    console.log('\n');
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
  }
}

async function main() {
  await extractDocx('Naija_Cars_Feature_Specification.docx');
  await extractDocx('Naija_Cars_Enhanced_Business_Plan.docx');
  await extractDocx('Naija_Cars_Business_Plan.docx');
}

main();
