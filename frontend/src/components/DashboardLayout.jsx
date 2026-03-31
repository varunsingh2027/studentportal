import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ title, user, onLogout, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={user?.role} />
      <main className="flex-1">
        <Navbar title={title} user={user} onLogout={onLogout} />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;
