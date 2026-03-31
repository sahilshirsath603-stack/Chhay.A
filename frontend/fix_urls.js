const fs = require('fs');
const path = require('path');

const walkSync = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkSync(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            const badString1 = "${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`}";
            const goodString1 = "${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}";
            
            if (content.includes(badString1)) {
                content = content.split(badString1).join(goodString1);
                changed = true;
            }

            const badString1b = "${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/signup";
            const goodString1b = "${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/signup`";
            // Wait, double check if it generated \`http://.../auth/signup\` -> \`\${...}/auth/signup\`
            // No, the regex was replacing 'http...' with `${...}/auth/signup`

            const badString2 = "(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000')";
            // Actually it was `socket = io(process.env.REACT_APP_SOCKET_URL || (process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'), {`
            const badString2a = "process.env.REACT_APP_SOCKET_URL || (process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000')";
            const goodString2a = "process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'";
            if (content.includes(badString2a)) {
                content = content.split(badString2a).join(goodString2a);
                changed = true;
            }

            const badString3 = "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`/me\\\", tokenHeaders)";
            // It actually replaced /me\", into /me",
            // Let's just do a plain regex replace for typical cases to fix
            
            // Fix double backticks or bad quotes:
            // `${.../api}`/somepath\" => `${.../api}/somepath`
            const regexMessyQuote = /\`\$\{process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000\/api'\}\`\/([a-zA-Z0-9_\-\/]+)\\"\/?/g;
            if (regexMessyQuote.test(content)) {
                content = content.replace(regexMessyQuote, "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/$1`");
                changed = true;
            }

            const regexMessyQuote2 = /\`\$\{process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000\/api'\}\`\/([a-zA-Z0-9_\-\/]+)\\"/g;
            if (regexMessyQuote2.test(content)) {
                content = content.replace(regexMessyQuote2, "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/$1`");
                changed = true;
            }

            const regexMessySocket = /\(process\.env\.REACT_APP_SOCKET_URL \|\| 'http:\/\/localhost:5000'\)/g;
            // Ensure no double paranthesis or double wrapped.
            
            // For socket context and page:
            // socketRef.current = io((process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'), {
            if (content.includes("((process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000')")) {
                content = content.split("((process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'), {").join("(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {");
                changed = true;
            }
            
            // api.js baseURL double wrapped
            if (content.includes("baseURL: process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`, ")) {
                 content = content.replace("baseURL: process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`,", "baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',");
                 changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    });
};

walkSync(path.join(__dirname, 'src'));
console.log('Fix complete.');
