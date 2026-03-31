import { Link } from "react-router-dom";

function Sidebar({ role }) {
  const links =
    role === "admin"
      ? [{ to: "/admin", label: "Admin Dashboard" }]
      : [{ to: "/student", label: "Student Dashboard" }];

  return (
    <aside className="min-h-screen w-64 border-r border-slate-200 bg-white p-4">
      <h2 className="mb-5 text-xl font-bold text-blue-700">Student Portal</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
