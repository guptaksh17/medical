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
  Eye
} from "lucide-react";
import { Patient } from "@shared/schema";
import { formatDate } from "@/lib/utils/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroup, setBloodGroup] = useState('all');
  const { toast } = useToast();

  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ['/api/patients', searchTerm, bloodGroup],
    queryFn: async ({ queryKey }) => {
      const [base, search, blood] = queryKey;
      const url = new URL(base as string, window.location.origin);

      if (search) url.searchParams.append('searchTerm', search as string);
      if (blood && blood !== 'all') url.searchParams.append('bloodGroup', blood as string);

      console.log("Fetching patients from:", url.toString());

      // Get the token from localStorage
      const token = localStorage.getItem('token');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching patients:", response.status, errorText);
        throw new Error(`Failed to fetch patients: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Patients data:", data);
      return data;
    }
  });

  // Log any errors
  if (error) {
    console.error("Error in patients query:", error);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled automatically through the queryKey dependencies
    console.log("Searching for:", searchTerm, "with blood group:", bloodGroup);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await apiRequest('DELETE', `/api/patients/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const bloodGroups = [
    { value: 'all', label: 'All Blood Groups' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' }
  ];

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search patients..."
                className="pl-10 pr-4 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={bloodGroup}
              onValueChange={setBloodGroup}
            >
              <SelectTrigger className="ml-2 w-[180px]">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
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
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients && patients.length > 0 ? (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">P{String(patient.id).padStart(3, '0')}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3 text-sm font-medium text-neutral-900">{patient.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.bloodGroup || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-900">{patient.phone}</div>
                        <div className="text-xs text-neutral-500">{patient.email}</div>
                      </TableCell>
                      <TableCell>{formatDate(patient.dob) || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-3">
                          <Link href={`/admin/patients/view/${patient.id}`}>
                            <Button variant="link" size="sm" className="text-primary">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/patients/edit/${patient.id}`}>
                            <Button variant="link" size="sm" className="text-primary">
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(patient.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {patients && patients.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-neutral-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{patients.length}</span> of{" "}
              <span className="font-medium">{patients.length}</span> results
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
      </div>
    </div>
  );
}
