// src/components/brand/BrandAccessForm.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function BrandAccessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    organization: '',
    purpose: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/brand/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success(data.message || 'Request submitted successfully!');
      setIsSuccess(true);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred while submitting the request.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-green-200 dark:border-green-900/50 max-w-lg mx-auto">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Request Received!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Thank you for your interest in our brand guidelines. We have received your request, and a confirmation email has been sent to <strong>{formData.email}</strong>. Once our team approves your request, you will receive a follow-up email with your secure access link.
        </p>
        <Link href="/press" className="block w-full">
          <Button type="button" className="w-full py-3">
            Return to Press Page
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Access the Brand Kit</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          To maintain the integrity of our visual identity, please request access below.
        </p>
      </div>

      <Input
        id="email"
        label="Email Address"
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="you@example.com"
      />
      
      <Input
        id="name"
        label="Full Name (Optional)"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="Jane Doe"
      />

      <Input
        id="organization"
        label="Organization/Company (Optional)"
        name="organization"
        type="text"
        value={formData.organization}
        onChange={handleChange}
        placeholder="Partner NGO, Media House, etc."
      />

      <TextArea
        id="purpose"
        label="Purpose of Access"
        name="purpose"
        required
        value={formData.purpose}
        onChange={handleChange}
        placeholder="Please briefly explain why you need access to the JaSiriCup logos and brand assets."
        rows={4}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Request Access'}
      </Button>
    </form>
  );
}