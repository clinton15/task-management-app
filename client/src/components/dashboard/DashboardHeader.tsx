import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AuthUser } from "@/types/user";

type DashboardHeaderProps = {
  user: AuthUser;
  onLogout: () => void;
};

const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
          <p className="text-sm text-slate-500">Task Management</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          <Badge variant="secondary">{user.role}</Badge>

          <Button variant="outline" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
