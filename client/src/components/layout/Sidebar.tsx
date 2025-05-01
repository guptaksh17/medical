import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCircle,
  MessageSquare,
  BarChart,
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/",
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: "/appointments",
      name: "Appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      path: "/patients",
      name: "Patients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      path: "/doctors",
      name: "Doctors",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      path: "/feedback",
      name: "Feedback",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      path: "/reports",
      name: "Reports",
      icon: <BarChart className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-neutral-100 md:min-h-screen">
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link href={item.path}>
                <a
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    location === item.path
                      ? "bg-primary-50 text-primary font-medium"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
