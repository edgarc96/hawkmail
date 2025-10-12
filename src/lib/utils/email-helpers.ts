export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high": return "text-red-600 bg-red-50";
    case "medium": return "text-yellow-600 bg-yellow-50";
    case "low": return "text-green-600 bg-green-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "replied": return "text-green-600 bg-green-50";
    case "pending": return "text-yellow-600 bg-yellow-50";
    case "overdue": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

export const getTimeRemaining = (deadline: string): string => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  
  if (diff < 0) return "Overdue";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};