"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

export const VolunteerForm = ({ roles }: { roles: string[] }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    roles: [] as string[],
  });
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // We format the message so it looks great in your Admin Inbox
      const formattedMessage = `Roles of Interest: ${formData.roles.length > 0 ? formData.roles.join(", ") : "None selected"}\nPhone Number: ${formData.phone}\n\nWhy I want to volunteer:\n${formData.message}`;

      // We route it to your existing contact API so it drops right into your CMS Inbox
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: "Volunteer Application",
          message: formattedMessage,
        }),
      });

      if (res.ok) {
        setStatus({
          type: "success",
          message:
            "Application submitted successfully! We will be in touch shortly.",
        });
        setFormData({ name: "", email: "", phone: "", message: "", roles: [] });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Submission failed");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors"
    >
      <div className="space-y-4 mb-6">
        <Input
          id="name"
          label="Full Name*"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Jane Doe"
        />
        <Input
          id="email"
          type="email"
          label="Email Address*"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="jane.doe@example.com"
        />
        <Input
          id="phone"
          type="tel"
          label="Phone Number*"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(123) 456-7890"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-200 text-lg font-medium mb-3">
          Roles of Interest
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((role) => (
            <label
              key={role}
              className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.roles.includes(role)}
                onChange={() => handleRoleToggle(role)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded border-gray-300"
                
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {role}
              </span>
            </label>
          ))}
        </div>
      </div>

      <TextArea
        id="message"
        label="Why do you want to volunteer?*"
        required
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Share a bit about yourself and why you're interested in volunteering with JasiriCup."
      />

      {status.type && (
        <div
          className={`p-4 mb-6 rounded-lg font-medium ${status.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"} border`}
        >
          {status.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
};
