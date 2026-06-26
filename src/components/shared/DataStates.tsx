import { Loader2, FileX, AlertCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Loader2 size={32} className="text-primary animate-spin mb-4" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ 
  title = "No data found",
  message = "There are no records to display.",
  icon: Icon = FileX,
  action,
}: { 
  title?: string;
  message?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center px-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-foreground text-base">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-medicare-red-light flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-medicare-red" />
      </div>
      <h3 className="font-display font-semibold text-foreground text-base">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      message={`No records match "${query}". Try adjusting your search.`}
    />
  );
}
