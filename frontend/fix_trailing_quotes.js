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

            // Problem: strings start with ` 
            // e.g. `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/me"
            // We need to replace that trailing " or ' with `
            
            // Simple regex: look for /api'}/SOMETHING" -> api'}/SOMETHING`
            const regexTrailingDoubleQuote = /\}\/([a-zA-Z0-9_\-\/\?\=]+)\"([,\s\)])/g;
            if (regexTrailingDoubleQuote.test(content)) {
                content = content.replace(regexTrailingDoubleQuote, "}/$1`$2");
                changed = true;
            }

            const regexTrailingSingleQuote = /\}\/([a-zA-Z0-9_\-\/\?\=]+)\'([,\s\)])/g;
            if (regexTrailingSingleQuote.test(content)) {
                content = content.replace(regexTrailingSingleQuote, "}/$1`$2");
                changed = true;
            }

            // Let's also catch cases where query parameters are there like ?username=${username}
            // Actually, in Register.js:
            // `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/check-username?username=${username}`);
            // Wait, does it end with ` already or " ?
            // Let's check the grep output!
            // const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/check-username?username=${username}`);
            // That one actually looks correct because it was already a template literal.
            // Oh wait, if it was template literal, my script matched starting ` but left ending ` alone?
            // Yes, so template literals are fine. 

            // Looking specifically for `/me",` and `/presence",` and `/request",`
            const specificFixes = [
               { bad: '/me\\",', good: '/me`,' },
               { bad: '/users\\",', good: '/users`,' },
               { bad: '/connections/sent\\",', good: '/connections/sent`,' },
               { bad: '/auth/presence\\",', good: '/auth/presence`,' },
               { bad: '/connections/request\\",', good: '/connections/request`,' },
               { bad: '/connections/all\\",', good: '/connections/all`,' },
               { bad: '/notifications\\",', good: '/notifications`,' },
               { bad: '/notifications/read\\",', good: '/notifications/read`,' },
               { bad: '/me",', good: '/me`,' },
               { bad: '/users",', good: '/users`,' },
               { bad: '/connections/sent",', good: '/connections/sent`,' },
               { bad: '/auth/presence",', good: '/auth/presence`,' },
               { bad: '/connections/request",', good: '/connections/request`,' },
               { bad: '/connections/all",', good: '/connections/all`,' },
               { bad: '/notifications",', good: '/notifications`,' },
               { bad: '/notifications/read",', good: '/notifications/read`,' }
            ];

            for (let fix of specificFixes) {
                if (content.includes(fix.bad)) {
                    content = content.split(fix.bad).join(fix.good);
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed quotes in:', fullPath);
            }
        }
    });
};

walkSync(path.join(__dirname, 'src'));
console.log('Quote fix complete.');
