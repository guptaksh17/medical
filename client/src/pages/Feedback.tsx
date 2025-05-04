import React from "react";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircleHeartIcon } from "lucide-react";

interface FeedbackProps {
  isForm?: boolean;
  appointmentId?: string;
}

export default function Feedback({ isForm = false, appointmentId }: FeedbackProps) {
  const apptId = appointmentId ? parseInt(appointmentId) : undefined;

  if (isForm && apptId) {
    return (
      <>
        <h2 className="text-xl font-bold mb-6">Provide Feedback</h2>
        <FeedbackForm appointmentId={apptId} />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Feedback</h2>
        {/* Provide Feedback button removed */}
      </div>
      <FeedbackList />
    </>
  );
}
