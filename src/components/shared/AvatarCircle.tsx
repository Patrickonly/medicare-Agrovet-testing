import { getInitials } from "@/hooks/use-data";

interface AvatarCircleProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  imageUrl?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function AvatarCircle({ firstName, lastName, size = "sm", imageUrl }: AvatarCircleProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
      <span className="font-semibold text-primary">{getInitials(firstName, lastName)}</span>
    </div>
  );
}
