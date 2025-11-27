export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20";
    case 'medium':
      return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
    case 'low':
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    default:
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'new':
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    case 'open':
      return "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20";
    case 'pending':
      return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
    case 'resolved':
    case 'closed':
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    default:
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'billing':
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case 'technical':
      return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20";
    case 'sales':
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
    case 'support':
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    default:
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  }
};

export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment.toLowerCase()) {
    case 'urgent':
      return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse";
    case 'negative':
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20";
    case 'positive':
      return "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20";
    case 'neutral':
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    default:
      return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20";
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
