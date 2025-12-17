import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import homeIcon from "@/assets/home-icon.png";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path?: string) => {
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <img
        src={homeIcon}
        alt="Home"
        className="w-3.5 h-3.5 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      />
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <ChevronRight className="w-2.5 h-2.5" />
          {item.path ? (
            <span
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleClick(item.path)}
            >
              {item.label}
            </span>
          ) : (
            <span className="text-muted-foreground/60">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
