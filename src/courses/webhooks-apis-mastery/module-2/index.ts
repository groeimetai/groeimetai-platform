import { apiKeysBearerTokens } from './api-keys-bearer-tokens';
import { oauthInPractice } from './oauth-in-practice';
import { geavanceerdeAuthenticatie } from './geavanceerde-authenticatie';
import { securityBestPractices } from './security-best-practices';

export const module2 = {
  id: 'module-2',
  title: 'API authenticatie en security',
  description: 'OAuth, API keys, en veilige verbindingen',
  lessons: [
    apiKeysBearerTokens,
    oauthInPractice,
    geavanceerdeAuthenticatie,
    securityBestPractices
  ]
};