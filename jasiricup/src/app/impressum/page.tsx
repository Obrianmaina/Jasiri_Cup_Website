import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function ImpressumPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Impressum', href: '/impressum' }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Impressum (Legal Notice)</h1>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Information pursuant to GDPR regulations</h2>
        
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Operator of the Website</h3>
            <p>JasiriCup Initiative</p>
            <p>[Your Street Address]</p>
            <p>[Your City, Postal Code]</p>
            <p>Kenya</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Represented by</h3>
            <p>[First Name Last Name / Board of Directors]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Contact Information</h3>
            <p>Email: hello@jasiricup.com</p>
            <p>Phone: +254 [Your Phone Number]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Registration</h3>
            <p>Registered NGO / Company Number: [Registration Number, if applicable]</p>
            <p>Register Court: [Court Name, if applicable]</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Liability for Links</h3>
            <p className="text-sm mt-1">Our site contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this external content. The respective provider or operator of the pages is always responsible for the content of the linked pages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}