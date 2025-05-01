import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { FeedbackWithRelations } from "@/types";
import { Loader2 } from "lucide-react";

export function RecentFeedback() {
  const { data: recentFeedback, isLoading } = useQuery<FeedbackWithRelations[]>({
    queryKey: ['/api/feedback/recent'],
  });

  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Recent Feedback</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {recentFeedback && recentFeedback.length > 0 ? (
              recentFeedback.map((feedback) => (
                <div key={feedback.id} className="border-b border-neutral-100 pb-4">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                        {feedback.appointment.patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-2 text-sm font-medium">
                        {feedback.appointment.patient.name}
                      </div>
                    </div>
                    <Rating value={feedback.rating} size="sm" />
                  </div>
                  <p className="text-sm text-neutral-600">{feedback.comments}</p>
                  <div className="mt-1 text-xs text-neutral-400">
                    For {feedback.appointment.doctor.name} • {feedback.appointment.specialization}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No feedback available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
