const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/UnifiedProfileLayout.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix duplicate className issue on line 1092
content = content.replace(/className=\{`([^`]+)`\}\s+fill\s+sizes="[^"]*"\s+className="([^"]+)"/g, (match, classList1, classList2) => {
    return `fill sizes="(max-width: 768px) 100vw, 33vw" className={\`${classList1} ${classList2}\`}`;
});

// Add onError handler to all <Image ... />
content = content.replace(/<Image([^>]+)\/>/g, (match, attrs) => {
    if (attrs.includes('onError')) return match;
    
    // determine what fallback to use based on the context
    let fallback = '`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "User")}&background=0f766e&color=fff&size=800`';
    if (attrs.includes('Advertisement') || attrs.includes('heroBottomAd') || attrs.includes('heroRightAd') || attrs.includes('heroTopAd')) {
        fallback = '"/placeholder.png"';
    } else if (attrs.includes('Gallery') || attrs.includes('Video thumbnail') || attrs.includes('gallery') || attrs.includes('vehicle') || attrs.includes('driver')) {
        fallback = '"/placeholder.png"'; // gallery fallback
    }

    // append onError
    return `<Image${attrs} onError={(e) => { (e.target as HTMLImageElement).srcset = ""; (e.target as HTMLImageElement).src = ${fallback}; }} />`;
});

fs.writeFileSync(file, content);
console.log("Fixed UnifiedProfileLayout images.");
