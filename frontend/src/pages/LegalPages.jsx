import React from 'react';

const LegalLayout = ({ title, children, date }) => (
  <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-poppins pt-24 px-6 pb-12">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-2 text-primary">{title}</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: {date}</p>
      <div className="prose dark:prose-invert max-w-none space-y-6">
        {children}
      </div>
    </div>
  </div>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" date="October 2023">
    <p>At PrePick, we take your privacy seriously. This policy describes how we collect and use your data.</p>
    <h3 className="text-xl font-bold mt-4">1. Information We Collect</h3>
    <ul className="list-disc pl-5">
      <li><strong>Personal Info:</strong> Name, Email, Phone number (for order updates).</li>
      <li><strong>Order Data:</strong> What you eat helps us recommend better food.</li>
    </ul>
    <h3 className="text-xl font-bold mt-4">2. Data Security</h3>
    <p>Your data is encrypted and never sold to third-party advertisers.</p>
  </LegalLayout>
);

export const TermsOfService = () => (
  <LegalLayout title="Terms of Service" date="October 2023">
    <p>By using PrePick, you agree to the following terms.</p>
    <h3 className="text-xl font-bold mt-4">1. Order Cancellations</h3>
    <p>Orders cannot be cancelled once the status is 'Preparing'. Refunds are processed only for failed transactions.</p>
    <h3 className="text-xl font-bold mt-4">2. User Conduct</h3>
    <p>Any misuse of the Cash on Pickup facility (3+ No Shows) will result in a permanent ban from using cash payments.</p>
  </LegalLayout>
);

export const CookiePolicy = () => (
  <LegalLayout title="Cookie Policy" date="October 2023">
    <p>We use cookies to improve your experience.</p>
    <h3 className="text-xl font-bold mt-4">1. Essential Cookies</h3>
    <p>These are required for you to log in and place orders securely.</p>
    <h3 className="text-xl font-bold mt-4">2. Analytics</h3>
    <p>We track which shops are most popular to help vendors improve their menu.</p>
  </LegalLayout>
);