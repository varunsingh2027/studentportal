import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import Card from "../components/Card";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [exportBranchFilter, setExportBranchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: debouncedSearch,
      };
      const response = await api.get("/students", { params });
      
      // Handle response structure depending on if it's paginated or not (backend updated)
      const data = response.data;
      if (data.students) {
        setStudents(data.students);
        setTotalPages(data.pagination?.pages || 1);
        setTotalStudents(data.pagination?.total || 0);
      } else {
        // Fallback if backend not updated yet or returns array
        setStudents(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalStudents(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, debouncedSearch]);

  const deleteProfile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Profile deleted");
      loadStudents(); // Reload list
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const quickUpdateBranch = async (item, branchValue) => {
    try {
      const response = await api.put(`/students/${item._id}`, { branch: branchValue });
      toast.success("Branch updated");
      loadStudents(); // Refresh to ensure data consistency
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      const params = {};
      if (exportBranchFilter.trim()) {
        params.branch = exportBranchFilter.trim();
      }

      const response = await api.get("/export", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export started");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" user={user} onLogout={logout}>
      <div className="mb-4 grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="text-2xl font-bold">{totalStudents}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Students List</h2>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <input
              placeholder="Search by name, email, or branch"
              className="w-full rounded-md border border-slate-300 px-3 py-2 md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              placeholder="Export filter by branch"
              className="w-full rounded-md border border-slate-300 px-3 py-2 md:w-48"
              value={exportBranchFilter}
              onChange={(e) => setExportBranchFilter(e.target.value)}
            />
            <button
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
              onClick={exportToExcel}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-4 text-center">Loading students...</p>
        ) : (
          <>
            <div className="space-y-4">
              {students.map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-200 p-4 transition-shadow hover:shadow-sm">
                  <div className="flex flex-col justify-between gap-2 md:flex-row">
                    <div>
                      <p className="font-semibold text-lg">{item.userId?.name || "Unknown"}</p>
                      <p className="text-sm text-slate-600">{item.userId?.email}</p>
                      <div className="mt-2 text-sm text-slate-700">
                        <span className="mr-3">
                          <strong>Enrol No:</strong> {item.enrollmentNumber || "N/A"}
                        </span>
                        <span className="mr-3">
                          <strong>Sem:</strong> {item.semester || "N/A"}
                        </span>
                        <span className="mr-3">
                          <strong>Branch:</strong> {item.branch}
                        </span>
                        <span className="mr-3">
                          <strong>Gender:</strong> {item.gender}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Skills: {(item.skills || []).join(", ") || "None"}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <button
                        className="rounded px-3 py-1 text-sm bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                        onClick={() => {
                          const val = prompt("Update branch for " + (item.userId?.name || "student"), item.branch || "");
                          if (val !== null && val.trim()) quickUpdateBranch(item, val.trim());
                        }}
                      >
                        Edit Branch
                      </button>
                      <button
                        className="rounded px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        onClick={() => deleteProfile(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-4 text-xs text-slate-400">
                    <span>Certs: {item.certifications?.length || 0}</span>
                    <span>Hacks: {item.hackathons?.length || 0}</span>
                  </div>
                </div>
              ))}
              {!students.length && (
                <p className="text-center text-slate-500 py-4">No students found.</p>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2 items-center">
                <button
                  disabled={page === 1}
                  className="rounded border px-3 py-1 disabled:opacity-50 hover:bg-slate-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="px-2 text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  className="rounded border px-3 py-1 disabled:opacity-50 hover:bg-slate-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default AdminDashboard;
