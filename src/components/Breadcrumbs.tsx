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
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <img
        src={homeIcon}
        alt="Home"
        className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      />
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3" />
          {item.path ? (
            <span
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleClick(item.path)}
            >
              {item.label}
            </span>
          ) : (
            <span className="text-primary">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
