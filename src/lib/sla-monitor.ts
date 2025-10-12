// SLA Monitoring utilities
// This can be called from a cron job or background task

export async function runSLAMonitoring() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/monitor/sla`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('SLA monitoring failed');
    }

    const data = await response.json();
    console.log('SLA monitoring completed:', data);
    return data;
  } catch (error) {
    console.error('SLA monitoring error:', error);
    throw error;
  }
}

// Helper function to calculate SLA deadline based on priority
export function calculateSLADeadline(priority: string, receivedAt: Date): Date {
  const deadlineMinutes = {
    critical: 30,  // 30 minutes
    high: 60,      // 1 hour
    medium: 240,   // 4 hours
    low: 480,      // 8 hours
  };

  const minutes = deadlineMinutes[priority as keyof typeof deadlineMinutes] || 240;
  return new Date(receivedAt.getTime() + minutes * 60 * 1000);
}

// Helper function to format time remaining
export function formatTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  
  if (diff < 0) {
    const overdue = Math.abs(diff);
    const hours = Math.floor(overdue / (1000 * 60 * 60));
    const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `-${hours}h ${minutes}m` : `-${minutes}m`;
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}