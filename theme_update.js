const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
    // Backgrounds going from dark slate to silver/white
    { oldStr: '#0f172a', newStr: '#ffffff' }, // card bg -> white
    { oldStr: '#020617', newStr: '#f1f5f9' }, // main bg -> light silver
    { oldStr: 'background: "rgba(15, 23, 42', newStr: 'background: "rgba(255, 255, 255' },
    { oldStr: 'background: "#1e293b"', newStr: 'background: "#e2e8f0"' },
    { oldStr: 'backgroundColor: "#020617"', newStr: 'backgroundColor: "#f8fafc"' },
    { oldStr: 'backgroundColor: "#0f172a"', newStr: 'backgroundColor: "#ffffff"' },

    // Borders going from dark slate to soft silver
    { oldStr: '#1e293b', newStr: '#cbd5e1' },
    { oldStr: 'border: "1px solid #334155"', newStr: 'border: "1px solid #94a3b8"' },

    // Texts going from white/light to dark for visibility
    { oldStr: 'color: "#f1f5f9"', newStr: 'color: "#1e293b"' },
    { oldStr: 'color: "#f8fafc"', newStr: 'color: "#0f172a"' },
    { oldStr: 'color: "#fff"', newStr: 'color: "#1e293b"' },
    { oldStr: 'color: "white"', newStr: 'color: "#1e293b"' },
    { oldStr: 'color: "#e2e8f0"', newStr: 'color: "#334155"' },
    { oldStr: 'color: "#cbd5e1"', newStr: 'color: "#475569"' },

    // Muted texts
    { oldStr: 'color: "#94a3b8"', newStr: 'color: "#64748b"' },
    { oldStr: 'color: "#64748b"', newStr: 'color: "#475569"' },

    // Blue tones shifted from "night mode neon blue" to professional corporate blue
    { oldStr: '#38bdf8', newStr: '#0284c7' }, // light blue -> darker blue
    { oldStr: 'linear-gradient(135deg, #38bdf8, #818cf8)', newStr: 'linear-gradient(135deg, #0284c7, #4f46e5)' }
];

function scanAndReplace(d) {
    const files = fs.readdirSync(d);
    files.forEach(f => {
        const fullPath = path.join(d, f);
        if (fs.statSync(fullPath).isDirectory()) {
            scanAndReplace(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            replacements.forEach(({ oldStr, newStr }) => {
                // String replaceAll using split.join
                content = content.split(oldStr).join(newStr);
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated theme in: ' + f);
            }
        }
    });
}

scanAndReplace(dir);
console.log('Theme update complete.');
