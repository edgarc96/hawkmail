/**
 * Advanced SLA Management Service
 * Handles business hours, holidays, priority-based SLAs, and customer tiers
 */

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  enabled: boolean;
}

export interface SLARule {
  id: string;
  name: string;
  priority?: 'high' | 'medium' | 'low';
  customerTier?: 'vip' | 'enterprise' | 'standard';
  targetMinutes: number;
  warningThresholdPercent: number; // Alert when X% of time remaining
  enabled: boolean;
}

export interface CustomerTier {
  email: string;
  tier: 'vip' | 'enterprise' | 'standard';
}

export class SLAAdvancedService {
  /**
   * Calculate SLA deadline considering business hours
   */
  static calculateSLADeadline(
    startDate: Date,
    targetMinutes: number,
    businessHours: BusinessHours,
    holidays: Holiday[]
  ): Date {
    if (!businessHours.enabled) {
      // Simple calculation without business hours
      return new Date(startDate.getTime() + targetMinutes * 60 * 1000);
    }

    // Calculate with business hours
    let remainingMinutes = targetMinutes;
    let currentDate = new Date(startDate);
    
    while (remainingMinutes > 0) {
      // Check if current day is a holiday
      const dateStr = currentDate.toISOString().split('T')[0];
      const isHoliday = holidays.some(h => h.date === dateStr && h.enabled);
      
      if (isHoliday) {
        // Skip to next day
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
        continue;
      }

      // Get day of week
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[currentDate.getDay()] as keyof BusinessHours['schedule'];
      const daySchedule = businessHours.schedule[dayName];

      if (!daySchedule.enabled) {
        // Skip to next day
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
        continue;
      }

      // Parse business hours
      const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
      const [endHour, endMinute] = daySchedule.end.split(':').map(Number);

      const dayStart = new Date(currentDate);
      dayStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      // If current time is before business hours, move to start
      if (currentDate < dayStart) {
        currentDate = new Date(dayStart);
      }

      // If current time is after business hours, move to next day
      if (currentDate >= dayEnd) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
        continue;
      }

      // Calculate available minutes in current day
      const availableMinutes = Math.floor((dayEnd.getTime() - currentDate.getTime()) / (60 * 1000));

      if (remainingMinutes <= availableMinutes) {
        // Can finish within this day
        currentDate = new Date(currentDate.getTime() + remainingMinutes * 60 * 1000);
        remainingMinutes = 0;
      } else {
        // Need to continue in next business day
        remainingMinutes -= availableMinutes;
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
      }
    }

    return currentDate;
  }

  /**
   * Get SLA target minutes based on priority and customer tier
   */
  static getSLATarget(
    priority: 'high' | 'medium' | 'low',
    customerTier: 'vip' | 'enterprise' | 'standard',
    rules: SLARule[]
  ): number {
    // Find matching rule
    const matchingRule = rules.find(
      rule => rule.enabled && 
      (!rule.priority || rule.priority === priority) &&
      (!rule.customerTier || rule.customerTier === customerTier)
    );

    if (matchingRule) {
      return matchingRule.targetMinutes;
    }

    // Default SLA targets
    const defaults: Record<string, Record<string, number>> = {
      vip: {
        high: 60,     // 1 hour
        medium: 240,  // 4 hours
        low: 480,     // 8 hours
      },
      enterprise: {
        high: 120,    // 2 hours
        medium: 480,  // 8 hours
        low: 1440,    // 24 hours
      },
      standard: {
        high: 240,    // 4 hours
        medium: 1440, // 24 hours
        low: 2880,    // 48 hours
      },
    };

    return defaults[customerTier][priority];
  }

  /**
   * Calculate time remaining until SLA breach
   */
  static getTimeRemaining(slaDeadline: Date): {
    totalMinutes: number;
    hours: number;
    minutes: number;
    isBreached: boolean;
    percentRemaining: number;
  } {
    const now = new Date();
    const totalMinutes = Math.floor((slaDeadline.getTime() - now.getTime()) / (60 * 1000));
    
    const isBreached = totalMinutes < 0;
    const hours = Math.abs(Math.floor(totalMinutes / 60));
    const minutes = Math.abs(totalMinutes % 60);

    // Assuming 24 hours SLA for percent calculation
    const totalSLAMinutes = 24 * 60;
    const percentRemaining = isBreached ? 0 : Math.max(0, (totalMinutes / totalSLAMinutes) * 100);

    return {
      totalMinutes,
      hours,
      minutes,
      isBreached,
      percentRemaining,
    };
  }

  /**
   * Check if warning threshold is reached
   */
  static shouldSendWarning(
    slaDeadline: Date,
    targetMinutes: number,
    warningThresholdPercent: number = 20
  ): boolean {
    const remaining = this.getTimeRemaining(slaDeadline);
    const percentRemaining = (remaining.totalMinutes / targetMinutes) * 100;
    
    return !remaining.isBreached && percentRemaining <= warningThresholdPercent;
  }

  /**
   * Get customer tier from email address
   */
  static getCustomerTier(
    email: string,
    customerTiers: CustomerTier[]
  ): 'vip' | 'enterprise' | 'standard' {
    const tier = customerTiers.find(ct => ct.email === email);
    return tier?.tier || 'standard';
  }

  /**
   * Calculate business hours between two dates
   */
  static calculateBusinessHoursBetween(
    startDate: Date,
    endDate: Date,
    businessHours: BusinessHours,
    holidays: Holiday[]
  ): number {
    if (!businessHours.enabled) {
      return Math.floor((endDate.getTime() - startDate.getTime()) / (60 * 1000));
    }

    let minutes = 0;
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      // Check if holiday
      const dateStr = currentDate.toISOString().split('T')[0];
      const isHoliday = holidays.some(h => h.date === dateStr && h.enabled);

      if (!isHoliday) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[currentDate.getDay()] as keyof BusinessHours['schedule'];
        const daySchedule = businessHours.schedule[dayName];

        if (daySchedule.enabled) {
          const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
          const [endHour, endMinute] = daySchedule.end.split(':').map(Number);

          const dayStart = new Date(currentDate);
          dayStart.setHours(startHour, startMinute, 0, 0);

          const dayEnd = new Date(currentDate);
          dayEnd.setHours(endHour, endMinute, 0, 0);

          // Calculate minutes in business hours for this day
          const effectiveStart = currentDate < dayStart ? dayStart : currentDate;
          const effectiveEnd = endDate < dayEnd ? endDate : dayEnd;

          if (effectiveStart < effectiveEnd) {
            minutes += Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (60 * 1000));
          }
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return minutes;
  }

  /**
   * Format SLA status for display
   */
  static formatSLAStatus(slaDeadline: Date): {
    status: 'critical' | 'warning' | 'healthy' | 'breached';
    color: string;
    message: string;
  } {
    const remaining = this.getTimeRemaining(slaDeadline);

    if (remaining.isBreached) {
      return {
        status: 'breached',
        color: '#ef4444',
        message: `Breached ${remaining.hours}h ${remaining.minutes}m ago`,
      };
    }

    if (remaining.percentRemaining <= 10) {
      return {
        status: 'critical',
        color: '#f97316',
        message: `${remaining.hours}h ${remaining.minutes}m remaining`,
      };
    }

    if (remaining.percentRemaining <= 30) {
      return {
        status: 'warning',
        color: '#eab308',
        message: `${remaining.hours}h ${remaining.minutes}m remaining`,
      };
    }

    return {
      status: 'healthy',
      color: '#22c55e',
      message: `${remaining.hours}h ${remaining.minutes}m remaining`,
    };
  }
}

/**
 * Default business hours configuration
 */
export const defaultBusinessHours: BusinessHours = {
  enabled: false,
  timezone: 'America/New_York',
  schedule: {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: false },
    sunday: { start: '09:00', end: '17:00', enabled: false },
  },
};

/**
 * Default SLA rules
 */
export const defaultSLARules: SLARule[] = [
  {
    id: 'vip-high',
    name: 'VIP - High Priority',
    priority: 'high',
    customerTier: 'vip',
    targetMinutes: 60,
    warningThresholdPercent: 20,
    enabled: true,
  },
  {
    id: 'enterprise-high',
    name: 'Enterprise - High Priority',
    priority: 'high',
    customerTier: 'enterprise',
    targetMinutes: 120,
    warningThresholdPercent: 20,
    enabled: true,
  },
  {
    id: 'standard-high',
    name: 'Standard - High Priority',
    priority: 'high',
    customerTier: 'standard',
    targetMinutes: 240,
    warningThresholdPercent: 20,
    enabled: true,
  },
];
