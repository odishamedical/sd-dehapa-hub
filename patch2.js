const fs = require('fs');
let code = fs.readFileSync('src/app/portal/doctor/page.tsx', 'utf8');

code = code.replace(
    '          </div>\n        )\n\n        {/* Tab: Qualifications */}',
    '          </div>\n        )}\n\n        {/* Tab: Qualifications */}'
).replace(
    '          </div>\r\n        )\r\n\r\n        {/* Tab: Qualifications */}',
    '          </div>\r\n        )}\r\n\r\n        {/* Tab: Qualifications */}'
);

fs.writeFileSync('src/app/portal/doctor/page.tsx', code, 'utf8');
