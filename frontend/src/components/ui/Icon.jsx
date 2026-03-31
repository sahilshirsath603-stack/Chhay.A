import * as LucideIcons from "lucide-react";

export default function Icon({
    name,
    size = 18,
    strokeWidth = 1.8,
    className = "",
    ...props
}) {
    const LucideIcon = LucideIcons[name];

    if (!LucideIcon) return null;

    return (
        <LucideIcon
            size={size}
            strokeWidth={strokeWidth}
            className={`app-icon ${className}`}
            {...props}
        />
    );
}
