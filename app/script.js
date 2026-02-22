const fs = require('fs');
const file = 'd:/talisto_pro/app/src/hooks/useApi.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;`;

const replacement = `    const { data: activeOrg } = authClient.useActiveOrganization();
    const activeOrgId = activeOrg?.id;`;

// Replace all occurrences
content = content.split(target).join(replacement);
fs.writeFileSync(file, content);
console.log('Replaced all occurrences successfully');
