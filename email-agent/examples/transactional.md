# Transactional Email Examples

## Example 1: Order Confirmation

### Input Variables
```yaml
name: Chris
business_type: ecommerce
offer: order confirmation
product: HomeGlow
cta_link: https://example.com/orders/12345
email_type: transactional
campaign_goal: confirmation and trust
```

### Output Email

#### Subject
`Order confirmed: #12345`

#### Preview Text
`Thanks Chris, your order is being prepared now.`

#### Email Body (Structured)
- Preheader: `Order #12345 confirmed on April 9, 2026.`
- Hero Headline: `Your order is confirmed`
- Hero Supporting Copy: `We have started preparing your items and will notify you when they ship.`
- Primary CTA: `View Order Status` -> `https://example.com/orders/12345`
- Confirmation Details:
  - `Order Number: 12345`
  - `Payment: Visa ending 1122`
  - `Shipping Method: Standard`
  - `Estimated Delivery: April 14-16`
- Reassurance Block: `Need help? Contact support within your order page.`
- Closing CTA Line: `Track progress anytime.`
- Footer Note: `This is a service email related to your purchase.`

### Why It Works
- Leads with certainty and core details.
- Functional CTA supports next expected action.
- Avoids promotional clutter in system communication.

---

## Example 2: Password Reset

### Input Variables
```yaml
name: Pat
business_type: SaaS
offer: password reset request
product: VaultDesk
cta_link: https://example.com/reset/token
email_type: transactional
campaign_goal: secure account recovery
```

### Output Email

#### Subject
`Reset your VaultDesk password`

#### Preview Text
`Use this secure link within 30 minutes.`

#### Email Body (Structured)
- Preheader: `Password reset requested for your VaultDesk account.`
- Hero Headline: `Reset your password`
- Hero Supporting Copy: `Use the secure link below to set a new password.`
- Primary CTA: `Reset Password` -> `https://example.com/reset/token`
- Details Block:
  - `Link expires in 30 minutes`
  - `If you did not request this, ignore this email`
  - `Your current password will remain active until changed`
- Reassurance Block: `Account security is our priority.`
- Closing CTA Line: `Complete your reset now.`
- Footer Note: `This is a security notice for your account.`

### Why It Works
- Explicit and action-oriented.
- Includes expiration and safety context.
- Keeps content short for urgent utility.

---

## Example 3: Appointment Reminder

### Input Variables
```yaml
name: Dana
business_type: service business
offer: appointment reminder
product: CareClinic
cta_link: https://example.com/appointments/confirm
email_type: transactional
campaign_goal: reduce no-shows
```

### Output Email

#### Subject
`Reminder: your appointment is tomorrow at 10:30 AM`

#### Preview Text
`Confirm or reschedule in one click.`

#### Email Body (Structured)
- Preheader: `Appointment reminder for April 10 at 10:30 AM.`
- Hero Headline: `Your appointment is coming up`
- Hero Supporting Copy: `We are scheduled to see you tomorrow at 10:30 AM.`
- Primary CTA: `Confirm Appointment` -> `https://example.com/appointments/confirm`
- Details Block:
  - `Location: 220 Main Street`
  - `Provider: Dr. Lee`
  - `Need changes? Reschedule from your portal`
- Reassurance Block: `Arrive 10 minutes early for check-in.`
- Closing CTA Line: `Confirm now to lock your time slot.`
- Footer Note: `This reminder was triggered by your booking.`

### Why It Works
- Event info is immediate and complete.
- CTA offers practical control.
- Reduces operational issues with clear reminder context.

---

## Example 4: Invoice Available

### Input Variables
```yaml
name: Robin
business_type: B2B SaaS
offer: monthly invoice ready
product: OpsStack
cta_link: https://example.com/billing/invoice/456
email_type: transactional
campaign_goal: billing clarity
```

### Output Email

#### Subject
`Your April OpsStack invoice is ready`

#### Preview Text
`View, download, or pay securely from your billing portal.`

#### Email Body (Structured)
- Preheader: `Invoice #456 issued on April 9, 2026.`
- Hero Headline: `Invoice available`
- Hero Supporting Copy: `Your monthly invoice is now available in your billing center.`
- Primary CTA: `View Invoice` -> `https://example.com/billing/invoice/456`
- Details Block:
  - `Invoice Number: 456`
  - `Amount Due: $1,240.00`
  - `Due Date: April 23, 2026`
- Reassurance Block: `Questions? Reply to billing support for assistance.`
- Closing CTA Line: `Open billing to review details.`
- Footer Note: `This is a required billing notification.`

### Why It Works
- Communicates required financial detail clearly.
- Functional CTA reduces support tickets.
- Trust-first structure supports transactional intent.
