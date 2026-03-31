const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace template strings like `http://localhost:5000/api/...`
    if (content.includes('`http://localhost:5000/api/')) {
        content = content.replace(/`http:\/\/localhost:5000\/api\//g, "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/");
        changed = true;
    }
    // Replace template strings `http://localhost:5000/uploads/...`
    if (content.includes('`http://localhost:5000/uploads/')) {
        content = content.replace(/`http:\/\/localhost:5000\/uploads\//g, "`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}/uploads/");
        changed = true;
    }

    // Replace standalone string literals "http://localhost:5000/api/..." -> (process.env... + "/...")
    if (content.includes('"http://localhost:5000/api/')) {
        content = content.replace(/"http:\/\/localhost:5000\/api\//g, "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/");
        content = content.replace(/"http:\/\/localhost:5000\/api"/g, "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`");
        // Warning: This turns "url" into `url` but leaves trailing double quote, so we need regex to catch the whole string
    }

    // Better regex for string literals (single or double quotes)
    // /['"]http:\/\/localhost:5000\/api([^'"]*)['"]/g 
    // Wait, replacing 'http://localhost:5000/api/...' with `${process.env...}/...`
    
    // Also remove console.logs
    const lines = content.split('\n');
    const newLines = lines.filter(line => !line.trim().startsWith('console.log(') || line.includes('//')); // Very basic log removal
    
    if (lines.length !== newLines.length) {
       content = newLines.join('\n');
       changed = true;
    }

    // Let's do a reliable regex replace for the localhost:5000/api
    const regexApi = /(['"`])http:\/\/localhost:5000\/api([^'"`]*)\1/g;
    if (regexApi.test(content)) {
        content = content.replace(regexApi, "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}$2`");
        changed = true;
    }

    const regexSocket = /(['"`])http:\/\/localhost:5000\1/g;
    if (regexSocket.test(content)) {
        content = content.replace(regexSocket, "(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000')");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
};

const walkSync = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkSync(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    });
};

walkSync(directoryPath);
console.log('Done.');
