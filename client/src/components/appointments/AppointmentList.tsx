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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DownloadIcon,
  FilterIcon,
  SearchIcon,
  Loader2,
  Pencil,
  Trash,
  CheckCircle
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatTime } from "@/lib/utils/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AppointmentWithRelations } from "@/types";

export function AppointmentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all_statuses');
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery<AppointmentWithRelations[]>({
    queryKey: ['/api/appointments', searchTerm, statusFilter],
    queryFn: async ({ queryKey }) => {
      const [base, search, status] = queryKey;
      const url = new URL(base as string, window.location.origin);

      if (search) url.searchParams.append('search', search as string);
      if (status && status !== 'all_statuses') url.searchParams.append('status', status as string);

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      return response.json();
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The queryKey will handle the refetch based on state changes
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      await apiRequest('DELETE', `/api/appointments/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to mark this appointment as ${status}?`)) {
      return;
    }

    const appointment = appointments?.find(a => a.id === id);
    if (!appointment) return;

    try {
      await apiRequest('PUT', `/api/appointments/${id}`, {
        ...appointment,
        status
      });

      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Success",
        description: `Appointment marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update appointment status`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="ml-2 w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </form>

        {/* Export and Filter buttons removed */}
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
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments && appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                          {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">{appointment.patient.name}</div>
                          <div className="text-xs text-neutral-500">{appointment.patient.bloodGroup} Blood Group</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-neutral-900">{appointment.doctor.name}</div>
                      <div className="text-xs text-neutral-500">{appointment.specialization}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-neutral-900">{formatDate(appointment.date)}</div>
                      <div className="text-xs text-neutral-500">{formatTime(appointment.time)}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={appointment.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/admin/appointments/edit/${appointment.id}`}>
                          <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>

                        {appointment.status === 'Pending' && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-success p-0 h-auto"
                            onClick={() => handleStatusChange(appointment.id, 'Confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                        )}

                        {appointment.status !== 'Cancelled' && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-destructive p-0 h-auto"
                            onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                    No appointments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {appointments && appointments.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-neutral-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{appointments.length}</span> of{" "}
            <span className="font-medium">{appointments.length}</span> results
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
