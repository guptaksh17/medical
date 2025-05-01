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
import { Doctor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function DoctorList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expertise, setExpertise] = useState('all');
  const { toast } = useToast();
  
  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors', searchTerm, expertise],
    queryFn: async ({ queryKey }) => {
      const [base, search, exp] = queryKey;
      const url = new URL(base as string, window.location.origin);
      
      if (search) url.searchParams.append('search', search as string);
      if (exp && exp !== 'all') url.searchParams.append('expertise', exp as string);
      
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      
      return response.json();
    }
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The queryKey will handle the refetch based on state changes
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiRequest('DELETE', `/api/doctors/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };
  
  // Get unique expertise values from doctors for the filter dropdown
  const expertiseOptions = doctors
    ? Array.from(new Set(doctors.map((d) => d.expertise)))
    : [];
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search doctors..."
                className="pl-10 pr-4 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={expertise}
              onValueChange={setExpertise}
            >
              <SelectTrigger className="ml-2 w-[180px]">
                <SelectValue placeholder="Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {expertiseOptions.map((exp) => (
                  <SelectItem key={exp} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <FilterIcon className="h-4 w-4 mr-1" />
              Filter
            </Button>
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
                  <TableHead>Doctor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors && doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">D{String(doctor.id).padStart(3, '0')}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700">
                            {doctor.name.split(' ').filter(name => name.startsWith('Dr.')).length > 0 
                              ? doctor.name.split(' ').filter(name => !name.startsWith('Dr.')).map(n => n[0]).join('')
                              : doctor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3 text-sm font-medium text-neutral-900">{doctor.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.expertise}</TableCell>
                      <TableCell>{doctor.experience} years</TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-900">{doctor.phone}</div>
                        <div className="text-xs text-neutral-500">{doctor.gender}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-3">
                          <Link href={`/doctors/view/${doctor.id}`}>
                            <Button variant="link" size="sm" className="text-primary">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/doctors/edit/${doctor.id}`}>
                            <Button variant="link" size="sm" className="text-primary">
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDelete(doctor.id)}
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
                      No doctors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {doctors && doctors.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-neutral-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{doctors.length}</span> of{" "}
              <span className="font-medium">{doctors.length}</span> results
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
