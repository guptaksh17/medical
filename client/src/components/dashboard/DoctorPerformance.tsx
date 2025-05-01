import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { TopDoctor } from "@/types";
import { Loader2 } from "lucide-react";

export function DoctorPerformance() {
  const { data: topDoctors, isLoading } = useQuery<TopDoctor[]>({
    queryKey: ['/api/doctors/top-rated'],
  });

  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Top Rated Doctors</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {topDoctors && topDoctors.length > 0 ? (
              topDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700">
                      {doctor.name.split(' ').filter(name => name.startsWith('Dr.')).length > 0 
                        ? doctor.name.split(' ').filter(name => !name.startsWith('Dr.')).map(n => n[0]).join('')
                        : doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-neutral-900">{doctor.name}</div>
                      <div className="text-xs text-neutral-500">
                        {doctor.expertise} • {doctor.experience} yrs exp
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Rating value={doctor.avgRating} showValue={true} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No doctor ratings available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
