import DashboardWrapper from "./dashboardWrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
