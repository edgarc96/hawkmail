"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Clock, AlertCircle, CheckCircle, User, Calendar, XCircle, Reply, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      <DialogContent className="max-w-2xl bg-[#2a1f3d] border-purple-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Mail className="text-purple-400" size={24} />
            Email Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject */}
          <div>
            <label className="text-purple-300 text-sm font-semibold">Subject</label>
            <p className="text-white text-lg mt-1">{email.subject}</p>
          </div>

          {/* Email Content */}
          {email.bodyContent && (
            <div>
              <label className="text-purple-300 text-sm font-semibold flex items-center gap-2">
                <Mail size={16} />
                Email Content
              </label>
              <div className="mt-2 p-4 bg-[#1a0f2e]/60 rounded-lg border border-purple-500/20 max-h-96 overflow-y-auto">
                <div className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                  {email.bodyContent}
                </div>
              </div>
            </div>
          )}

          {/* Sender & Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-purple-300 text-sm font-semibold flex items-center gap-2">
                <User size={16} />
                From
              </label>
              <p className="text-white mt-1">{email.senderEmail}</p>
            </div>
            <div>
              <label className="text-purple-300 text-sm font-semibold flex items-center gap-2">
                <User size={16} />
                To
              </label>
              <p className="text-white mt-1">{email.recipientEmail}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-purple-300 text-sm font-semibold flex items-center gap-2">
                <Calendar size={16} />
                Received At
              </label>
              <p className="text-white mt-1">{new Date(email.receivedAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-purple-300 text-sm font-semibold flex items-center gap-2">
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
              <label className="text-purple-300 text-sm font-semibold flex items-center gap-2">
                <CheckCircle size={16} />
                First Reply At
              </label>
              <p className="text-white mt-1">{new Date(email.firstReplyAt).toLocaleString()}</p>
            </div>
          )}

          {/* Status & Priority Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-purple-300 text-sm font-semibold mb-2 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[#1a0f2e] border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a1f3d] border-purple-500/30">
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="replied" className="text-white">Replied</SelectItem>
                  <SelectItem value="overdue" className="text-white">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-purple-300 text-sm font-semibold mb-2 block">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-[#1a0f2e] border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a1f3d] border-purple-500/30">
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
              className="w-4 h-4 rounded border-purple-500/30 bg-[#1a0f2e] text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="resolved" className="text-purple-300 text-sm font-semibold cursor-pointer">
              Mark as Resolved
            </label>
          </div>

          {/* Reply Section */}
          <div className="border-t border-purple-500/20 pt-6">
            {!showReplyForm ? (
              <Button
                onClick={() => setShowReplyForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-2"
                disabled={email.isResolved}
              >
                <Reply size={16} />
                Reply to Email
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-purple-300 text-sm font-semibold flex items-center gap-2 mb-2">
                    <Reply size={16} />
                    Your Reply
                  </label>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[120px] bg-[#1a0f2e]/60 border-purple-500/30 text-white placeholder:text-purple-400 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendReply}
                    disabled={isReplying || !replyContent.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-2"
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
                    className="border-gray-600/30 text-gray-300 hover:bg-gray-600/20 transition-all"
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            disabled={isUpdating || isReplying}
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}