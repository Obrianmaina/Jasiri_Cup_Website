import { ContactForm } from "@/components/contact/ContactForm";

export default function GetInTouchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <p className="text-sm text-gray-500 mb-4">Home / Get In Touch</p>
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Get In Touch</h1>
      <div className="max-w-2xl mx-auto">
        <ContactForm />
      </div>
    </div>
  );
}
