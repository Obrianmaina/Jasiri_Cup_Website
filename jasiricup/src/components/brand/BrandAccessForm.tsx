// src/components/brand/BrandAccessForm.tsx
"use client";

import { useState } from 'react';
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
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">Request Received</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Thank you! Our team will review your request to access the Brand OS. You will receive an email once your access is approved.
        </p>
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