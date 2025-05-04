import React from "react";
import { Link } from "wouter";
import { DoctorList } from "@/components/doctors/DoctorList";
import { DoctorForm } from "@/components/doctors/DoctorForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Doctor } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Rating } from "@/components/ui/rating";

interface DoctorsProps {
  isForm?: boolean;
  isEditMode?: boolean;
  isView?: boolean;
  id?: string;
}

export default function Doctors({ isForm = false, isEditMode = false, isView = false, id }: DoctorsProps) {
  const doctorId = id ? parseInt(id) : undefined;

  const { data: doctor, isLoading } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${doctorId}`],
    enabled: isView && !!doctorId,
  });

  const { data: topRatedDoctors } = useQuery({
    queryKey: ['/api/doctors/top-rated'],
    enabled: isView && !!doctorId,
  });

  // Find the doctor's rating from the top rated doctors list
  const doctorRating = topRatedDoctors?.find(d => d.id === doctorId)?.avgRating || 0;

  if (isForm) {
    return (
      <>
        <h2 className="text-xl font-bold mb-6">{isEditMode ? "Edit Doctor" : "Add New Doctor"}</h2>
        <DoctorForm doctorId={doctorId} isEditMode={isEditMode} />
      </>
    );
  }

  if (isView && doctorId) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (!doctor) {
      return (
        <div className="text-center my-12">
          <h2 className="text-2xl font-bold text-neutral-700">Doctor Not Found</h2>
          <p className="mt-2 text-neutral-600">The doctor you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/doctors">Back to Doctors</Link>
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Doctor Details</h2>
          <Link href={`/doctors/edit/${doctorId}`}>
            <Button>Edit Doctor</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-lg">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 text-xl font-semibold mr-4">
                    {doctor.name.split(' ').filter(name => name.startsWith('Dr.')).length > 0
                      ? doctor.name.split(' ').filter(name => !name.startsWith('Dr.')).map(n => n[0]).join('')
                      : doctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="text-neutral-500">Doctor ID: D{String(doctor.id).padStart(3, '0')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-500">Expertise</p>
                    <p className="font-medium">{doctor.expertise}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Experience</p>
                    <p className="font-medium">{doctor.experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Gender</p>
                    <p className="font-medium">{doctor.gender || 'Not specified'}</p>
                  </div>
                  {doctorRating > 0 && (
                    <div>
                      <p className="text-sm text-neutral-500">Rating</p>
                      <div className="mt-1">
                        <Rating value={doctorRating} showValue={true} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">Phone</p>
                  <p className="font-medium">{doctor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Address</p>
                  <p className="font-medium">{doctor.address || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor's appointment history could be added here */}
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Doctors</h2>
        <Link href="/admin/doctors/new">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add Doctor
          </Button>
        </Link>
      </div>
      <DoctorList />
    </>
  );
}
