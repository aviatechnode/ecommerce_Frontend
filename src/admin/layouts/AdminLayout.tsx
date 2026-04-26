import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR */}
      <AdminSidebar />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAV */}
        <AdminNavbar />

        {/* CONTENT (THIS IS CRITICAL) */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          <Outlet /> {/* 👈 THIS FIXES EVERYTHING */}
        </main>

      </div>
    </div>
  );
}