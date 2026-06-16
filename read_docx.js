const mammoth = require('mammoth');
const path = require('path');

async function extract() {
  try {
    const result = await mammoth.extractRawText({ path: path.join(__dirname, 'dr Jayanta.docx') });
    console.log(result.value);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

extract();
