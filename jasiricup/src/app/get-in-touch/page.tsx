import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function GetInTouchPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Get In Touch', href: '/contact' }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-8">
        Get In Touch
      </h1>

      <div className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto px-4 sm:px-0">
        <ContactForm />
      </div>
    </div>
  );
}
