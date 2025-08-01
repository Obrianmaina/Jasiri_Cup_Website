'use client'; // This is a Client Component

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', topic: '', message: '' }); // Clear form
      } else {
        setStatus(`Error: ${data.message || 'Something went wrong.'}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setStatus('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
      <Input
        id="name"
        label="Name*"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        id="topic"
        label="Topic*"
        type="text"
        value={formData.topic}
        onChange={handleChange}
        required
      />
      <TextArea
        id="message"
        label="Message*"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <div className="flex justify-center mt-6">
        <Button
          type="submit"
          variant="primary"
          size="large"
          className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-full"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
      {status && (
        <p className={`mt-4 text-center ${status.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </p>
      )}
    </form>
  );
};
