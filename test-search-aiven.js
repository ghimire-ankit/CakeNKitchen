const fs = require('fs');
const path = require('path');

let log = '';
function searchDir(dir, query) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchDir(fullPath, query);
        } else if (file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes(query.toLowerCase())) {
                log += `MATCH found in file: ${fullPath}\n`;
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.toLowerCase().includes(query.toLowerCase())) {
                        log += `  L${idx + 1}: ${line.trim()}\n`;
                    }
                });
            }
        }
    }
}

try {
    searchDir('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\6dda0a4a-e579-4320-a932-a0f5205fc71c', 'aiven');
    fs.writeFileSync('search-aiven-results.txt', log);
} catch (e) {
    fs.writeFileSync('search-aiven-results.txt', 'Error: ' + e.message);
}
