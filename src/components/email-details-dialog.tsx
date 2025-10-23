"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Clock, AlertCircle, CheckCircle, User, Calendar, XCircle, Reply, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmailRenderer } from "@/components/email-renderer";

// Helper function to sanitize and prepare HTML for safe rendering
function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script tags and other dangerous elements
  const scripts = temp.querySelectorAll('script, iframe, object, embed');
  scripts.forEach(el => el.remove());
  
  // Remove inline event handlers
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return temp.innerHTML;
}

interface Email {
  id: number;
  subject: string;
  senderEmail: string;
  recipientEmail: string;
  bodyContent?: string | null;
  receivedAt: string;
  slaDeadline: string;
  firstReplyAt: string | null;
  status: string;
  priority: string;
  isResolved: boolean;
}

interface EmailDetailsDialogProps {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function EmailDetailsDialog({ email, open, onOpenChange, onUpdate }: EmailDetailsDialogProps) {
  const [status, setStatus] = useState(email?.status || "pending");
  const [priority, setPriority] = useState(email?.priority || "medium");
  const [isResolved, setIsResolved] = useState(email?.isResolved || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Inject email content styles
  useEffect(() => {
    const styleId = 'email-content-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .email-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .email-content p {
          margin: 0 0 1em 0;
        }
        .email-content p:last-child {
          margin-bottom: 0;
        }
        .email-content a {
          color: #1a73e8;
          text-decoration: none;
        }
        .email-content a:hover {
          text-decoration: underline;
        }
        .email-content h1, .email-content h2, .email-content h3, 
        .email-content h4, .email-content h5, .email-content h6 {
          margin: 1em 0 0.5em 0;
          font-weight: 600;
        }
        .email-content ul, .email-content ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }
        .email-content li {
          margin: 0.25em 0;
        }
        .email-content blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 3px solid #ddd;
          color: #666;
        }
        .email-content img {
          max-width: 100%;
          height: auto;
        }
        .email-content table {
          border-collapse: collapse;
          margin: 1em 0;
        }
        .email-content table td, .email-content table th {
          border: 1px solid #ddd;
          padding: 8px;
        }
        .email-content strong, .email-content b {
          font-weight: 600;
        }
        .email-content em, .email-content i {
          font-style: italic;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!email) return null;

  const getTimeRemaining = (deadline: string): { text: string; isOverdue: boolean } => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff < 0) {
      const overdueMins = Math.abs(Math.floor(diff / (1000 * 60)));
      const hours = Math.floor(overdueMins / 60);
      const mins = overdueMins % 60;
      return { 
        text: hours > 0 ? `${hours}h ${mins}m overdue` : `${mins}m overdue`,
        isOverdue: true 
      };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { 
      text: hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`,
      isOverdue: false 
    };
  };

  const handleUpdateEmail = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/emails/${email.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          priority,
          isResolved,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update email");
      }

      toast.success("Email updated successfully");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update email");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsReplied = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/emails/${email.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "replied",
          firstReplyAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark as replied");
      }

      toast.success("Email marked as replied");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error marking as replied:", error);
      toast.error(error instanceof Error ? error.message : "Failed to mark as replied");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsResolved = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/emails/${email.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isResolved: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark as resolved");
      }

      toast.success("Email marked as resolved");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error marking as resolved:", error);
      toast.error(error instanceof Error ? error.message : "Failed to mark as resolved");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply content cannot be empty");
      return;
    }

    setIsReplying(true);
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/emails/${email.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ replyContent: replyContent.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reply");
      }

      toast.success("Reply sent successfully!");
      setReplyContent("");
      setShowReplyForm(false);
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const timeRemaining = getTimeRemaining(email.slaDeadline);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-slate-900/95 border-slate-700/50 text-white shadow-2xl backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Mail className="text-blue-400" size={24} />
            Email Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject */}
          <div>
            <label className="text-[#4ECDC4] text-sm font-semibold">Subject</label>
            <p className="text-white text-lg mt-1 font-medium">{email.subject}</p>
          </div>

          {/* Email Content - Renderizado profesional con EmailRenderer */}
          {email.bodyContent && (
            <div>
              <label className="text-blue-400 text-sm font-semibold flex items-center gap-2 mb-3">
                <Mail size={16} />
                Email Content
              </label>
              <div className="mt-2 p-6 bg-white rounded-xl border border-slate-300 max-h-[500px] overflow-y-auto shadow-lg">
                <EmailRenderer htmlContent={email.bodyContent} />
              </div>
            </div>
          )}

          {/* Sender & Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <User size={16} />
                From
              </label>
              <p className="text-white mt-1 font-medium">{email.senderEmail}</p>
            </div>
            <div>
              <label className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <User size={16} />
                To
              </label>
              <p className="text-white mt-1 font-medium">{email.recipientEmail}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <Calendar size={16} />
                Received At
              </label>
              <p className="text-white mt-1">{new Date(email.receivedAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <Clock size={16} />
                SLA Deadline
              </label>
              <p className="text-white mt-1">{new Date(email.slaDeadline).toLocaleString()}</p>
            </div>
          </div>

          {/* Time Remaining */}
          <div className={`p-4 rounded-lg ${timeRemaining.isOverdue ? 'bg-red-600/20 border border-red-500/30' : 'bg-green-600/20 border border-green-500/30'}`}>
            <div className="flex items-center gap-2">
              {timeRemaining.isOverdue ? (
                <AlertCircle className="text-red-400" size={20} />
              ) : (
                <Clock className="text-green-400" size={20} />
              )}
              <span className={`font-semibold ${timeRemaining.isOverdue ? 'text-red-300' : 'text-green-300'}`}>
                {timeRemaining.text}
              </span>
            </div>
          </div>

          {/* First Reply */}
          {email.firstReplyAt && (
            <div>
              <label className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                <CheckCircle size={16} />
                First Reply At
              </label>
              <p className="text-white mt-1">{new Date(email.firstReplyAt).toLocaleString()}</p>
            </div>
          )}

          {/* Status & Priority Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-blue-400 text-sm font-semibold mb-2 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-slate-800 border-slate-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700/50">
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="replied" className="text-white">Replied</SelectItem>
                  <SelectItem value="overdue" className="text-white">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-blue-400 text-sm font-semibold mb-2 block">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-slate-800 border-slate-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700/50">
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resolved Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="resolved"
              checked={isResolved}
              onChange={(e) => setIsResolved(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700/50 bg-slate-800 text-blue-400 focus:ring-blue-400"
            />
            <label htmlFor="resolved" className="text-blue-400 text-sm font-semibold cursor-pointer">
              Mark as Resolved
            </label>
          </div>

          {/* Reply Section - Mejorado */}
          <div className="border-t border-[#4ECDC4]/20 pt-6">
            {!showReplyForm ? (
              <Button
                onClick={() => setShowReplyForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-2 shadow-lg"
                disabled={email.isResolved}
              >
                <Reply size={16} />
                Reply to Email
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Original Email Preview - Renderizado profesional con EmailRenderer */}
                <div>
                  <label className="text-[#4ECDC4] text-sm font-semibold flex items-center gap-2 mb-2">
                    <Mail size={16} />
                    Original Message
                  </label>
                  <div className="p-4 bg-white rounded-lg border border-slate-300 max-h-[200px] overflow-y-auto shadow-md">
                    <EmailRenderer htmlContent={email.bodyContent || ''} />
                  </div>
                </div>
                <div>
                  <label className="text-blue-400 text-sm font-semibold flex items-center gap-2 mb-2">
                    <Reply size={16} />
                    Your Reply
                  </label>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[150px] bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 text-white placeholder:text-slate-400/60 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm rounded-lg shadow-inner"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendReply}
                    disabled={isReplying || !replyContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-2 shadow-lg"
                  >
                    {isReplying ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Reply
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                    variant="outline"
                    className="border-slate-600/30 text-slate-300 hover:bg-slate-600/20 transition-all"
                    disabled={isReplying}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-all"
            disabled={isUpdating || isReplying}
          >
            Close
          </button>
          {!email.firstReplyAt && (
            <button
              onClick={handleMarkAsReplied}
              className="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all flex items-center gap-2"
              disabled={isUpdating || isReplying}
            >
              <CheckCircle size={16} />
              Mark as Replied
            </button>
          )}
          {!email.isResolved && (
            <button
              onClick={handleMarkAsResolved}
              className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all flex items-center gap-2"
              disabled={isUpdating || isReplying}
            >
              <CheckCircle size={16} />
              Mark as Resolved
            </button>
          )}
          <button
            onClick={handleUpdateEmail}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg"
            disabled={isUpdating || isReplying}
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}