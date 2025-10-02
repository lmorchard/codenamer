const fs = require('fs');
const https = require('https');

const GO_URL = 'https://raw.githubusercontent.com/moby/moby/master/pkg/namesgenerator/names-generator.go';
const OUTPUT_PATH = 'src/moby_dict.json';

function downloadGoCode(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractDict(code) {
  const lines = code.split('\n').map(line => line.trim());
  const left = [];
  const right = [];

  let isLeft = false;
  let isRight = false;

  const namePattern = /^"([a-z]+)",$/;

  for (const line of lines) {
    if (line.startsWith('left =')) {
      isLeft = true;
      continue;
    }

    if (line.startsWith('right =')) {
      isRight = true;
      continue;
    }

    if (isLeft) {
      if (line.startsWith('}')) {
        isLeft = false;
        continue;
      }
      const match = line.match(namePattern);
      if (match) {
        left.push(match[1]);
      }
    }

    if (isRight) {
      if (line.startsWith('}')) {
        isRight = false;
        continue;
      }
      const match = line.match(namePattern);
      if (match) {
        right.push(match[1]);
      }
    }
  }

  return { left, right };
}

async function updateDict() {
  console.log(`Downloading from ${GO_URL}...`);
  const goCode = await downloadGoCode(GO_URL);

  console.log('Extracting dictionary...');
  const mobyDict = extractDict(goCode);

  console.log(`Writing to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mobyDict, null, 4) + '\n');

  console.log(`✓ Updated ${OUTPUT_PATH} (${mobyDict.left.length} left, ${mobyDict.right.length} right)`);
}

updateDict().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
