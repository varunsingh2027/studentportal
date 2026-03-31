function Navbar({ title, user, onLogout }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={onLogout}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
