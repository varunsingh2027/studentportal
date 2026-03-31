import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import Card from "../components/Card";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { isValidUrl, splitCsv } from "../utils/validators";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    branch: "",
    enrollmentNumber: "",
    semester: "",
    gender: "male",
    skills: "",
    certifications: "",
    hackathons: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/students/${user.id}`);
      const own = response.data;
      if (!own?._id) return;
      setProfileId(own._id);
      setForm({
        branch: own.branch || "",
        enrollmentNumber: own.enrollmentNumber || "",
        semester: own.semester || "",
        gender: own.gender || "male",
        skills: (own.skills || []).join(", "),
        certifications: (own.certifications || []).join(", "),
        hackathons: (own.hackathons || []).join(", "),
      });
    } catch (_error) {
      // Ignore when profile does not exist yet.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const certifications = splitCsv(form.certifications);
    const hackathons = splitCsv(form.hackathons);
    const skills = splitCsv(form.skills);

    const invalidCert = certifications.find((u) => !isValidUrl(u));
    if (invalidCert) return toast.error("One certification link is invalid");
    const invalidHack = hackathons.find((u) => !isValidUrl(u));
    if (invalidHack) return toast.error("One hackathon link is invalid");

    const payload = {
      branch: form.branch,
      enrollmentNumber: form.enrollmentNumber,
      semester: form.semester,
      gender: form.gender,
      skills,
      certifications,
      hackathons,
    };

    try {
      setSaving(true);
      if (profileId) {
        await api.put(`/students/${profileId}`, payload);
      } else {
        const response = await api.post("/students", payload);
        setProfileId(response.data._id);
      }
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const certCount = splitCsv(form.certifications).length;
  const hackCount = splitCsv(form.hackathons).length;

  return (
    <DashboardLayout title="Student Dashboard" user={user} onLogout={logout}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Certifications</p>
          <p className="text-2xl font-bold">{certCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Hackathons</p>
          <p className="text-2xl font-bold">{hackCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Skills</p>
          <p className="text-2xl font-bold">{splitCsv(form.skills).length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Profile Form</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading profile...</p>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-3">
            <input
              placeholder="Full Name"
              className="rounded-md border border-slate-300 px-3 py-2 bg-slate-100"
              value={user.name}
              disabled
            />
            <input
              placeholder="Email"
              className="rounded-md border border-slate-300 px-3 py-2 bg-slate-100"
              value={user.email}
              disabled
            />
            <input
              placeholder="Enrollment Number"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.enrollmentNumber}
              onChange={(e) => setForm((p) => ({ ...p, enrollmentNumber: e.target.value }))}
              required
            />
            <input
              placeholder="Semester (e.g. 1)"
              type="number"
              min="1"
              max="12"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.semester}
              onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
              required
            />
            <input
              placeholder="Branch (e.g. B.Tech CSE)"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.branch}
              onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
              required
            />
            <select
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.gender}
              onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              placeholder="Skills (comma separated)"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.skills}
              onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
            />
            <input
              placeholder="Certifications links (comma separated)"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.certifications}
              onChange={(e) => setForm((p) => ({ ...p, certifications: e.target.value }))}
            />
            <input
              placeholder="Hackathon links (comma separated)"
              className="rounded-md border border-slate-300 px-3 py-2"
              value={form.hackathons}
              onChange={(e) => setForm((p) => ({ ...p, hackathons: e.target.value }))}
            />
            <button
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save / Update Profile"}
            </button>
          </form>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default StudentDashboard;
