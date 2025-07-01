export const CERTIFICATE_CONFIG = {
  passingScore: 70,
  organizationName: 'GroeimetAI Academy',
  organizationLogo: '/images/logo/GroeimetAi_logo_image_black.png',
  organizationWebsite: 'https://groeimetai.com',
  qrCodeSize: 200,
  linkedinShareUrl: 'https://www.linkedin.com/sharing/share-offsite/?url=',
  allowRetake: true,
  maxRetakes: 3,
  retakeDelay: 24 * 60 * 60 * 1000, // 24 hours
}

export const BLOCKCHAIN_CONFIG = {
  enabled: false,
  network: 'polygon',
  contractAddress: '',
  explorerUrl: 'https://polygonscan.com',
}