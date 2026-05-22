'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';

interface FormData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
}

export const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    topic: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
    }
    
    if (formData.topic.trim().length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters';
    }
    
    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
    if (status) setStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Thank you! Your message has been sent successfully.');
        setFormData({ name: '', email: '', topic: '', message: '' });
        setErrors({});
      } else {
        // Extract and display specific backend validation errors
        if (data.errors && data.errors.length > 0) {
          const firstError = typeof data.errors[0] === 'string' 
            ? data.errors[0] 
            : data.errors[0].message || data.errors[0];
          setStatus(firstError);
        } else {
          setStatus(data.message || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      setStatus('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg space-y-6 transition-colors duration-300"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center transition-colors">
          Get In Touch
        </h2>

        <div>
          <Input
            id="name"
            label="Full Name*"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'border-red-500' : ''}
            placeholder='John Doe'
          />
          {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <Input
            id="email"
            label="Email Address*"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'border-red-500' : ''}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <Input
            id="topic"
            label="Subject/Topic*"
            value={formData.topic}
            onChange={handleChange}
            className={errors.topic ? 'border-red-500' : ''}
            placeholder="What is this regarding?"
          />
          {errors.topic && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.topic}</p>}
        </div>

        <div>
          <TextArea
            id="message"
            label="Message*"
            value={formData.message}
            onChange={handleChange}
            className={errors.message ? 'border-red-500' : ''}
            placeholder="Please share your thoughts, questions, or feedback..."
          />
          {errors.message && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.message}</p>
          )}
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 transition-colors">
            {formData.message.length}/1000 characters
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-10 py-4 rounded-full transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>

        {status && (
          <div
            className={`mt-6 p-4 rounded-md transition-colors duration-300 ${
              status.toLowerCase().includes('error') || status.toLowerCase().includes('must be') || status.toLowerCase().includes('failed')
                ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            }`}
          >
            <p className="text-center">{status}</p>
          </div>
        )}

        <p className="text-gray-500 dark:text-gray-400 text-sm text-center transition-colors">
          All fields marked with * are required
        </p>
      </form>
    </div>
  );
};