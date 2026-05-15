const fs = require('fs');

function findUnclosedTags(content) {
    const lines = content.split('\n');
    let stack = [];
    let state = 'NORMAL';
    let lineNum = 1;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Hacky regex parsing to find tags
        let tagMatches = line.matchAll(/<(\/?[a-zA-Z0-9_.-]+)[^>]*(\/?)>/g);
        for (let match of tagMatches) {
            let tagName = match[1];
            let selfClosing = match[2] === '/';
            
            if (selfClosing || line.includes('</' + tagName + '>')) continue; // Skip simple single line

            // Complex approach is required if the line has a tag without its closing on the same line.
        }
    }
}
