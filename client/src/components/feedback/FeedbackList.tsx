import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackWithRelations } from "@/types";
import { formatDate } from "@/lib/utils/date-utils";
import { Loader2, Search } from "lucide-react";
import { Rating } from "@/components/ui/rating";

export function FeedbackList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: feedback, isLoading } = useQuery<FeedbackWithRelations[]>({
    queryKey: ['/api/feedback'],
  });
  
  // Filter feedback based on search term
  const filteredFeedback = React.useMemo(() => {
    if (!feedback) return [];
    if (!searchTerm) return feedback;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return feedback.filter(item => 
      item.comments?.toLowerCase().includes(lowercasedSearch) ||
      item.appointment.patient.name.toLowerCase().includes(lowercasedSearch) ||
      item.appointment.doctor.name.toLowerCase().includes(lowercasedSearch) ||
      item.appointment.specialization.toLowerCase().includes(lowercasedSearch)
    );
  }, [feedback, searchTerm]);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Feedback and Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search feedback..."
              className="pl-10 pr-4 w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback && filteredFeedback.length > 0 ? (
                  filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                            {item.appointment.patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3 text-sm font-medium text-neutral-900">
                            {item.appointment.patient.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-900">{item.appointment.doctor.name}</div>
                        <div className="text-xs text-neutral-500">{item.appointment.specialization}</div>
                      </TableCell>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>
                        <Rating value={item.rating} />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{item.comments}</div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/appointments/view/${item.appointmentId}`}>
                          <Button variant="link" size="sm">
                            View Appointment
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                      {searchTerm ? "No feedback found matching your search" : "No feedback available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
