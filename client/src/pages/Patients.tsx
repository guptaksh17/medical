import React from "react";
import { Link } from "wouter";
import { PatientList } from "@/components/patients/PatientList";
import { PatientForm } from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Patient } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date-utils";
import { Loader2 } from "lucide-react";

interface PatientsProps {
  isForm?: boolean;
  isEditMode?: boolean;
  isView?: boolean;
  id?: string;
}

export default function Patients({ isForm = false, isEditMode = false, isView = false, id }: PatientsProps) {
  const patientId = id ? parseInt(id) : undefined;
  
  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: isView && !!patientId,
  });

  if (isForm) {
    return (
      <>
        <h2 className="text-xl font-bold mb-6">{isEditMode ? "Edit Patient" : "Add New Patient"}</h2>
        <PatientForm patientId={patientId} isEditMode={isEditMode} />
      </>
    );
  }

  if (isView && patientId) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (!patient) {
      return (
        <div className="text-center my-12">
          <h2 className="text-2xl font-bold text-neutral-700">Patient Not Found</h2>
          <p className="mt-2 text-neutral-600">The patient you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/patients">Back to Patients</Link>
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Patient Details</h2>
          <Link href={`/patients/edit/${patientId}`}>
            <Button>Edit Patient</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-semibold mr-4">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{patient.name}</h3>
                    <p className="text-neutral-500">Patient ID: P{String(patient.id).padStart(3, '0')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-500">Blood Group</p>
                    <p className="font-medium">{patient.bloodGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Date of Birth</p>
                    <p className="font-medium">{formatDate(patient.dob) || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Address</p>
                  <p className="font-medium">{patient.address || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient's appointment history could be added here */}
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Patients</h2>
        <Link href="/patients/new">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add Patient
          </Button>
        </Link>
      </div>
      <PatientList />
    </>
  );
}
