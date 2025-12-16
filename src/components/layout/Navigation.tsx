import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building, Users, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/properties", icon: Building, label: "Properties" },
  { to: "/tenants", icon: Users, label: "Tenants" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
];

export function Navigation() {
  return (
    <nav className="border-b bg-card">
      <div className="container px-4 md:px-6">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
