/**
 * Email Classifier Service
 * Automatically classifies emails based on keywords and patterns
 */

export interface EmailClassification {
  priority: 'high' | 'medium' | 'low';
  category: 'sales' | 'support' | 'billing' | 'complaint' | 'inquiry' | 'other';
  sentiment: 'urgent' | 'positive' | 'neutral' | 'negative';
  suggestedTags: string[];
  confidence: number;
}

const PRIORITY_KEYWORDS = {
  high: [
    'urgent', 'asap', 'immediately', 'critical', 'emergency', 'priority',
    'importante', 'urgente', 'critico', 'emergencia',
    'vip', 'escalation', 'deadline', 'time-sensitive',
    'complaint', 'angry', 'frustrated', 'unacceptable',
    'legal', 'lawyer', 'attorney', 'lawsuit'
  ],
  medium: [
    'important', 'please', 'request', 'need', 'question',
    'help', 'support', 'issue', 'problem',
    'follow up', 'follow-up', 'checking in'
  ],
  low: [
    'thanks', 'thank you', 'fyi', 'info', 'information',
    'update', 'notification', 'newsletter'
  ]
};

const CATEGORY_KEYWORDS = {
  sales: ['quote', 'pricing', 'purchase', 'buy', 'product', 'demo', 'trial'],
  support: ['help', 'issue', 'problem', 'error', 'bug', 'not working', 'broken'],
  billing: ['invoice', 'payment', 'charge', 'billing', 'refund', 'credit card'],
  complaint: ['disappointed', 'terrible', 'worst', 'complaint', 'unacceptable', 'frustrated'],
  inquiry: ['question', 'wondering', 'curious', 'information', 'details']
};

const SENTIMENT_KEYWORDS = {
  urgent: ['urgent', 'asap', 'immediately', 'now', 'right away', 'emergency'],
  negative: ['angry', 'frustrated', 'disappointed', 'terrible', 'worst', 'unacceptable'],
  positive: ['thank', 'great', 'excellent', 'amazing', 'love', 'appreciate']
};

export class EmailClassifier {
  /**
   * Classify an email based on subject and body content
   */
  static classify(subject: string, body?: string): EmailClassification {
    const text = `${subject} ${body || ''}`.toLowerCase();
    
    const priority = this.detectPriority(text);
    const category = this.detectCategory(text);
    const sentiment = this.detectSentiment(text);
    const suggestedTags = this.generateTags(text, priority, category);
    const confidence = this.calculateConfidence(text, priority, category);

    return {
      priority,
      category,
      sentiment,
      suggestedTags,
      confidence
    };
  }

  /**
   * Detect priority level based on keywords
   */
  private static detectPriority(text: string): 'high' | 'medium' | 'low' {
    let highScore = 0;
    let mediumScore = 0;
    let lowScore = 0;

    // Check for high priority keywords
    PRIORITY_KEYWORDS.high.forEach(keyword => {
      if (text.includes(keyword)) {
        highScore += keyword.length > 8 ? 3 : 2; // Longer keywords are more specific
      }
    });

    // Check for medium priority keywords
    PRIORITY_KEYWORDS.medium.forEach(keyword => {
      if (text.includes(keyword)) {
        mediumScore += 1;
      }
    });

    // Check for low priority keywords
    PRIORITY_KEYWORDS.low.forEach(keyword => {
      if (text.includes(keyword)) {
        lowScore += 1;
      }
    });

    // Additional heuristics
    if (text.includes('!!!') || text.includes('!!!')) highScore += 2;
    if (text.match(/[A-Z]{5,}/)) highScore += 1; // ALL CAPS
    if (text.includes('re:') || text.includes('fwd:')) mediumScore += 1;

    // Determine priority
    if (highScore > 0) return 'high';
    if (mediumScore > lowScore) return 'medium';
    return 'low';
  }

  /**
   * Detect email category
   */
  private static detectCategory(text: string): EmailClassification['category'] {
    let maxScore = 0;
    let detectedCategory: EmailClassification['category'] = 'other';

    Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) score++;
      });

      if (score > maxScore) {
        maxScore = score;
        detectedCategory = category as EmailClassification['category'];
      }
    });

    return detectedCategory;
  }

  /**
   * Detect sentiment
   */
  private static detectSentiment(text: string): EmailClassification['sentiment'] {
    let urgentScore = 0;
    let negativeScore = 0;
    let positiveScore = 0;

    SENTIMENT_KEYWORDS.urgent.forEach(keyword => {
      if (text.includes(keyword)) urgentScore++;
    });

    SENTIMENT_KEYWORDS.negative.forEach(keyword => {
      if (text.includes(keyword)) negativeScore++;
    });

    SENTIMENT_KEYWORDS.positive.forEach(keyword => {
      if (text.includes(keyword)) positiveScore++;
    });

    if (urgentScore > 0) return 'urgent';
    if (negativeScore > positiveScore) return 'negative';
    if (positiveScore > 0) return 'positive';
    return 'neutral';
  }

  /**
   * Generate suggested tags
   */
  private static generateTags(
    text: string,
    priority: string,
    category: string
  ): string[] {
    const tags: string[] = [];

    // Add priority tag if high
    if (priority === 'high') tags.push('🔥 High Priority');

    // Add category tag
    const categoryEmoji = {
      sales: '💰',
      support: '🛠️',
      billing: '💳',
      complaint: '😠',
      inquiry: '❓',
      other: '📧'
    };
    tags.push(`${categoryEmoji[category as keyof typeof categoryEmoji]} ${category}`);

    // Add special tags
    if (text.includes('deadline')) tags.push('⏰ Deadline');
    if (text.includes('vip') || text.includes('premium')) tags.push('⭐ VIP');
    if (text.includes('new customer') || text.includes('new client')) tags.push('🆕 New Customer');

    return tags;
  }

  /**
   * Calculate confidence score (0-100)
   */
  private static calculateConfidence(
    text: string,
    priority: string,
    category: string
  ): number {
    let confidence = 50; // Base confidence

    // Increase confidence if multiple keywords match
    const allKeywords = [
      ...PRIORITY_KEYWORDS[priority as keyof typeof PRIORITY_KEYWORDS] || [],
      ...CATEGORY_KEYWORDS[category as keyof typeof CATEGORY_KEYWORDS] || []
    ];

    let matches = 0;
    allKeywords.forEach(keyword => {
      if (text.includes(keyword)) matches++;
    });

    confidence += Math.min(matches * 10, 40);

    // Cap at 95% (never 100% confident without AI)
    return Math.min(confidence, 95);
  }

  /**
   * Get suggested assignee based on category and priority
   */
  static getSuggestedAssignee(
    classification: EmailClassification,
    teamMembers: Array<{ id: number; name: string; role: string; specialties?: string[] }>
  ): number | null {
    // Prioritize managers for high-priority complaints
    if (classification.priority === 'high' && classification.category === 'complaint') {
      const manager = teamMembers.find(m => m.role === 'manager');
      if (manager) return manager.id;
    }

    // Find specialist for category
    const specialist = teamMembers.find(m => 
      m.specialties?.includes(classification.category)
    );
    if (specialist) return specialist.id;

    // Find agent with lowest workload
    const agents = teamMembers.filter(m => m.role === 'agent');
    if (agents.length > 0) {
      // Would need workload data here - for now return first agent
      return agents[0].id;
    }

    return null;
  }
}