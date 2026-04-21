/**
 * EmailJS Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Setup instructions:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create an Email Service (Gmail, Outlook, etc.)
 * 3. Create Email Templates:
 *    - welcome_email (for new user registration)
 *    - order_confirmation (for order placed)
 * 4. Get your credentials from EmailJS dashboard
 * 5. Replace the values below
 * 
 * Template variables available:
 * 
 * welcome_email:
 *   - {{to_email}}
 *   - {{to_name}}
 *   - {{from_name}} = "MINO Shop"
 * 
 * order_confirmation:
 *   - {{to_email}}
 *   - {{to_name}}
 *   - {{order_id}}
 *   - {{order_total}}
 *   - {{order_items}} (JSON string)
 *   - {{from_name}} = "MINO Shop"
 */

export const environment = {
  production: false,

  // ── Admin ──────────────────────────────────────────────────────────────────
  // กำหนด admin email ใน environment.ts
  // Default: admin@mino.shop / password: admin1234
  googleClientId: '1078573327825-0k0r1pu8f2uc2qc7uttbu4fscr580gca.apps.googleusercontent.com',
  adminEmails: ['admin@mino.shop'],

  emailjs: {
    publicKey: 'YOUR_PUBLIC_KEY',           // จาก Account → API Keys
    serviceId: 'YOUR_SERVICE_ID',           // จาก Email Services
    templates: {
      welcome: 'YOUR_WELCOME_TEMPLATE_ID',  // Template ID สำหรับ welcome email
      order: 'YOUR_ORDER_TEMPLATE_ID',    // Template ID สำหรับ order confirmation
    },
  },
};
