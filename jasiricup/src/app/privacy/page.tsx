import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function PrivacyPolicyPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy', href: '/privacy' }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">1. Information We Collect</h2>
        <p>We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products, placing an order, or participating in our volunteer programs. This may include your name, email address, and phone number.</p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">2. How We Use Your Information</h2>
        <p>We use the information we collect or receive to fulfill and manage your orders, send you administrative information, respond to your inquiries, and for other business purposes like data analysis and identifying usage trends.</p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">3. GDPR Data Protection Rights</h2>
        <p>If you are a resident of the European Economic Area (EEA), you have the following data protection rights:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
          <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
          <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
          <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">4. Cookies and Tracking</h2>
        <p>We may use cookies and similar tracking technologies to access or store information. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.</p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">5. Contact Us</h2>
        <p>If you have questions or comments about this notice, you may email us at your.email@jasiricup.com.</p>
      </div>
    </div>
  );
}