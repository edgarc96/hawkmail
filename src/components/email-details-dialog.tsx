"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Clock, AlertCircle, CheckCircle, User, Calendar, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Email {
  id: number;
  subject: string;
  senderEmail: string;
  recipientEmail: string;
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
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-all"
            disabled={isUpdating}
          >
            Cancel
          </button>
          {!email.firstReplyAt && (
            <button
              onClick={handleMarkAsReplied}
              className="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all flex items-center gap-2"
              disabled={isUpdating}
            >
              <CheckCircle size={16} />
              Mark as Replied
            </button>
          )}
          {!email.isResolved && (
            <button
              onClick={handleMarkAsResolved}
              className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all flex items-center gap-2"
              disabled={isUpdating}
            >
              <CheckCircle size={16} />
              Mark as Resolved
            </button>
          )}
          <button
            onClick={handleUpdateEmail}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}