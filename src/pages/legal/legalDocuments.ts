export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocument = {
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
};

const EFFECTIVE_DATE = "August 25, 2026";

const contactText = (supportEmail: string | null) =>
  supportEmail
    ? `Contact us at ${supportEmail}.`
    : "Contact us through the Contact Support page after signing in.";

export const getPrivacyPolicy = (supportEmail: string | null): LegalDocument => ({
  title: "Privacy Policy",
  description: "How League Night Pro collects, uses, and protects information.",
  effectiveDate: EFFECTIVE_DATE,
  sections: [
    {
      title: "Overview",
      paragraphs: [
        "League Night LLC (\"League Night,\" \"we,\" \"us,\" or \"our\") operates League Night Pro. This policy explains the information we process when you visit or use the service.",
        "By using League Night Pro, you acknowledge the practices described in this policy. This policy does not apply to services operated independently by third parties.",
      ],
    },
    {
      title: "Information we collect",
      items: [
        "Account information, such as your name, email address, username, optional phone number, account role, and authentication information.",
        "Golf and league information, including player profiles, handicaps, teams, schedules, flights, scores, standings, announcements, and league settings.",
        "Payment and transaction information, such as purchased golfer capacity, payment status, transaction identifiers, and refund status. Payment-card details are collected and processed by Stripe rather than stored by League Night Pro.",
        "Communications, including support requests, feedback, and related delivery or response records.",
        "Technical and usage information, such as session information, browser and device details, approximate location derived from an IP address, pages viewed, and interactions with the service.",
        "Information received from league administrators, invited users, authentication providers, payment processors, and other people who use the service.",
      ],
    },
    {
      title: "How we use information",
      items: [
        "Provide, maintain, personalize, and improve League Night Pro.",
        "Authenticate accounts, manage permissions, and protect the service from misuse.",
        "Operate leagues and calculate scores, points, standings, statistics, and league handicaps.",
        "Process purchases, confirm payments, manage purchased capacity, and administer refunds.",
        "Send account, invitation, password-reset, service, and support communications.",
        "Measure product usage, diagnose problems, and understand which features are useful.",
        "Comply with legal obligations and enforce our agreements.",
      ],
    },
    {
      title: "Cookies and analytics",
      paragraphs: [
        "League Night Pro uses session technologies needed to keep users signed in and secure the service. When configured in production, we also use Google Analytics to understand service usage. Google Analytics may use first-party cookies and collect session statistics, approximate location, browser information, device information, and page interactions.",
        "You can limit cookies through your browser settings. Blocking required session cookies may prevent account features from working. Google also provides controls and an Analytics opt-out browser add-on. We do not intentionally send names, email addresses, score data, or other directly identifying account fields to Google Analytics.",
      ],
    },
    {
      title: "How information is disclosed",
      paragraphs: [
        "We disclose information only as reasonably necessary to operate the service, follow your instructions, protect users, or comply with law.",
      ],
      items: [
        "Other league participants and authorized viewers may see league information that is intended to be shared, such as player names, teams, handicaps, schedules, scores, standings, and statistics.",
        "League administrators can manage and view information associated with leagues they administer.",
        "Service providers may process information for hosting, databases, email delivery, analytics, authentication, customer support, and payment processing. These providers include Stripe, Google Analytics, and Resend when those services are configured.",
        "Information may be disclosed when required by law, to protect rights and safety, to investigate abuse, or in connection with a merger, financing, acquisition, or transfer of the business.",
      ],
    },
    {
      title: "Retention and security",
      paragraphs: [
        "We retain information for as long as reasonably needed to provide the service, maintain league records, complete transactions, resolve disputes, meet legal obligations, and protect the service. Retention periods vary by the type of information and why it is maintained.",
        "We use reasonable administrative, technical, and organizational safeguards. No internet transmission or storage system is completely secure, so we cannot guarantee absolute security.",
      ],
    },
    {
      title: "Your choices and requests",
      paragraphs: [
        "You may request access to, correction of, or deletion of your personal information. Some league records may need to be preserved or de-identified to maintain accurate results, comply with law, or protect other users. Depending on where you live, you may have additional privacy rights and the right to appeal a denied request.",
        contactText(supportEmail),
      ],
    },
    {
      title: "Children",
      paragraphs: [
        "League Night Pro is not directed to children under 13, and we do not knowingly collect personal information directly from children under 13. If you believe a child has provided information without appropriate authorization, please contact us.",
      ],
    },
    {
      title: "Changes to this policy",
      paragraphs: [
        "We may update this policy as the service or applicable requirements change. We will post the revised policy with a new effective date and provide additional notice when appropriate.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [contactText(supportEmail)],
    },
  ],
});

export const getTermsOfService = (supportEmail: string | null): LegalDocument => ({
  title: "Terms of Service",
  description: "The rules that apply when using League Night Pro.",
  effectiveDate: EFFECTIVE_DATE,
  sections: [
    {
      title: "Agreement to these terms",
      paragraphs: [
        "These Terms of Service form an agreement between you and League Night LLC governing your access to and use of League Night Pro. By creating an account, purchasing access, accepting an invitation, or using the service, you agree to these terms and our Privacy Policy.",
        "If you use the service for a club, league, company, or other organization, you represent that you are authorized to accept these terms for that organization.",
      ],
    },
    {
      title: "Eligibility and accounts",
      items: [
        "You must be legally capable of entering this agreement. Anyone purchasing or administering paid league capacity must be at least 18 years old.",
        "You must provide accurate account information, protect your credentials, and promptly notify us of suspected unauthorized access.",
        "You are responsible for activity performed through your account and for using permissions only as intended.",
      ],
    },
    {
      title: "The service",
      paragraphs: [
        "League Night Pro provides tools for organizing golf leagues, managing participants and events, entering scores, and calculating league standings, points, statistics, and handicaps. Features may change as the service evolves.",
        "League Night Pro handicap calculations are intended for league administration. Unless expressly stated otherwise, they are not an official USGA Handicap Index, World Handicap System record, or substitute for an authorized handicapping service.",
      ],
    },
    {
      title: "League administrators",
      paragraphs: [
        "League administrators control league configuration, access, rosters, schedules, scores, announcements, and other league records. Administrators are responsible for having appropriate authority to enter and share participant information, maintaining accurate records, and handling disputes within their leagues.",
        "We may provide tools to correct or synchronize league data, but administrators remain responsible for reviewing results and configuration before relying on them.",
      ],
    },
    {
      title: "Purchases and refunds",
      paragraphs: [
        "Golfer access is purchased separately for each league season through a one-time Stripe Checkout payment. A season purchase covers only the league season for which it is allocated and does not renew automatically. Starting a renewed or successor season requires a new purchase based on that season’s regular-golfer roster. Prices, quantities, and applicable taxes are shown before payment. You authorize Stripe and League Night Pro to process the displayed charge.",
        "Refunds are governed by the Refund Policy available on this site. Payment-provider and financial-institution processing times may apply.",
      ],
    },
    {
      title: "Your content",
      paragraphs: [
        "You retain ownership of information and content you submit. You grant League Night a non-exclusive, worldwide, royalty-free license to host, copy, process, display, and transmit that content only as needed to operate, secure, support, and improve the service.",
        "You represent that you have the rights and permissions needed to submit the content and make it available to the intended league participants and viewers.",
      ],
    },
    {
      title: "Acceptable use",
      items: [
        "Do not use the service unlawfully, fraudulently, or to harass, threaten, or harm another person.",
        "Do not access accounts, leagues, or data without authorization or attempt to bypass access controls.",
        "Do not interfere with the service, introduce malicious code, scrape at unreasonable volume, or probe for vulnerabilities without written permission.",
        "Do not submit content that infringes another person’s rights or contains unlawful, deceptive, or malicious material.",
        "Do not resell or commercially exploit the service except under a separate written agreement.",
      ],
    },
    {
      title: "Third-party services",
      paragraphs: [
        "The service may rely on or link to third-party services, including Stripe, Google, and email providers. Their services are governed by their own terms and policies, and League Night is not responsible for third-party services outside our control.",
      ],
    },
    {
      title: "Suspension and termination",
      paragraphs: [
        "You may stop using the service at any time. We may restrict or terminate access when reasonably necessary to address a violation of these terms, security risk, nonpayment, legal requirement, or material harm to the service or its users. Where practical, we will provide notice and an opportunity to resolve the issue.",
      ],
    },
    {
      title: "Disclaimers",
      paragraphs: [
        "To the fullest extent permitted by law, the service is provided “as is” and “as available.” We disclaim implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not guarantee uninterrupted availability or that every score, handicap, statistic, or calculation will be error-free.",
      ],
    },
    {
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, League Night and its owners, employees, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenues, data, goodwill, or league opportunities. Our total liability arising from the service will not exceed the amount you paid League Night for the service during the 12 months before the event giving rise to the claim.",
        "Some jurisdictions do not permit certain exclusions or limitations, so portions of this section may not apply to you.",
      ],
    },
    {
      title: "Indemnification",
      paragraphs: [
        "To the extent permitted by law, you agree to defend and indemnify League Night against third-party claims arising from your unlawful use of the service, your content, or your material violation of these terms. This obligation does not apply to the extent a claim was caused by League Night’s own conduct.",
      ],
    },
    {
      title: "General terms",
      paragraphs: [
        "These terms and the policies referenced here are the entire agreement concerning the service unless we enter a separate written agreement with you. If a provision is unenforceable, the remaining provisions remain effective. A failure to enforce a provision is not a waiver.",
        "Applicable law governs these terms without regard to conflict-of-law rules. Nothing in these terms limits consumer rights that cannot legally be waived. Before filing a claim, you agree to contact us and make a good-faith effort to resolve the issue informally.",
      ],
    },
    {
      title: "Changes and contact",
      paragraphs: [
        "We may update these terms as the service changes. Material changes will be posted with a revised effective date, and additional notice will be provided when required. Continued use after the updated terms take effect constitutes acceptance to the extent permitted by law.",
        contactText(supportEmail),
      ],
    },
  ],
});

export const getRefundPolicy = (supportEmail: string | null): LegalDocument => ({
  title: "Refund Policy",
  description: "When League Night Pro purchases may qualify for a refund.",
  effectiveDate: EFFECTIVE_DATE,
  sections: [
    {
      title: "Scope",
      paragraphs: [
        "This policy applies to one-time purchases of golfer access for a specific league season sold directly by League Night LLC through League Night Pro. It does not govern charges made by an unrelated third party or payment arrangements covered by a separate written agreement.",
      ],
    },
    {
      title: "Refund eligibility",
      paragraphs: [
        "You may request a refund within 14 calendar days after purchase. Refunds are generally available for duplicate charges, erroneous purchases, or paid golfer access that has not been allocated to or used by a league season.",
        "Access that has already been allocated, used to create or expand a league season, or relied upon to manage participants is generally non-refundable. We may make exceptions when required by law or when a verified service failure prevented meaningful use of the purchase.",
      ],
    },
    {
      title: "How to request a refund",
      paragraphs: [
        `Submit a billing support request and include the purchaser’s account email, purchase date, amount, and reason for the request. ${contactText(supportEmail)}`,
        "Do not include full payment-card numbers or other sensitive financial information in your request.",
      ],
    },
    {
      title: "Review and processing",
      paragraphs: [
        "We will review the account, payment, and capacity usage before approving or denying a request. We aim to respond within five business days, although complex requests may take longer.",
        "Approved refunds are sent to the original payment method through Stripe. Your bank or card issuer controls when the credit appears and may require additional processing time. Refunded capacity may be removed from the account, and an account may need to reduce league capacity before a refund can be completed.",
      ],
    },
    {
      title: "Partial refunds and promotions",
      paragraphs: [
        "When only part of a capacity purchase remains unused, we may issue a proportional refund for eligible unused capacity. Complimentary, promotional, or payment-exempt capacity has no cash value and is not refundable.",
      ],
    },
    {
      title: "Charge disputes and legal rights",
      paragraphs: [
        "Please contact us first if you do not recognize a charge or believe a billing error occurred so we can investigate promptly. This policy does not limit refund, cancellation, chargeback, or other consumer rights that cannot be waived under applicable law.",
      ],
    },
    {
      title: "Policy changes and contact",
      paragraphs: [
        "We may update this policy for future purchases. The policy in effect when a purchase was completed will generally govern that purchase unless applicable law requires otherwise.",
        contactText(supportEmail),
      ],
    },
  ],
});
