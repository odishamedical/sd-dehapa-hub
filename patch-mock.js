const fs = require('fs');
let code = fs.readFileSync('src/app/profile/[type]/[id]/page.tsx', 'utf8');

const mockImages = `rawImages: [
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
        ],`;

code = code.replace(
    'roster: ["Apollo Hospital, Bhubaneswar", "Sparsh Hospital, Bhubaneswar"]',
    'roster: ["Apollo Hospital, Bhubaneswar", "Sparsh Hospital, Bhubaneswar"],\n        ' + mockImages
);

code = code.replace(
    'roster: ["Utkal Hospital, Bhubaneswar"]',
    'roster: ["Utkal Hospital, Bhubaneswar"],\n        ' + mockImages
);

code = code.replace(
    'roster: ["VIMSAR, Burla", "Sambalpur Heart Clinic"]',
    'roster: ["VIMSAR, Burla", "Sambalpur Heart Clinic"],\n        ' + mockImages
);

code = code.replace(
    'roster: ["Pradyumna Bal Memorial Hospital", "KIMS, Bhubaneswar"]',
    'roster: ["Pradyumna Bal Memorial Hospital", "KIMS, Bhubaneswar"],\n        ' + mockImages
);

code = code.replace(
    'roster: ["Apollo Super Specialty, Bhubaneswar", "LifeCare Clinic, Sambalpur"]',
    'roster: ["Apollo Super Specialty, Bhubaneswar", "LifeCare Clinic, Sambalpur"],\n      ' + mockImages
);

code = code.replace(
    'roster: ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"]',
    'roster: ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"],\n      ' + mockImages
);

fs.writeFileSync('src/app/profile/[type]/[id]/page.tsx', code, 'utf8');
console.log("Mock images added.");
