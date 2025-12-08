import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface PageHeaderProps {
  title: string;
  actionButtonText?: string;
  onActionButtonClick?: () => void;
}

export function PageHeader({ title, actionButtonText, onActionButtonClick }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
      {actionButtonText && onActionButtonClick && (
        <Button onClick={onActionButtonClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {actionButtonText}
        </Button>
      )}
    </div>
  );
}