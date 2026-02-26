import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  role: string;
  firstName: string;
  lastName: string;
}

export default function Layout({ children, role, firstName, lastName }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} firstName={firstName} lastName={lastName} />
      <main className="flex-1 overflow-auto md:ml-0">
        {children}
      </main>
    </div>
  );
}
