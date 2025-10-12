"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Email } from "../types";

export function useEmails(onRefresh?: () => void) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleViewEmail = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails?id=${emailId}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to fetch email details");
      
      const email = await response.json();
      setSelectedEmail(email);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error("Failed to load email details");
    }
  };

  const handleMarkResolved = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true, status: "replied" }),
      });

      if (!response.ok) throw new Error("Failed to mark as resolved");
      
      toast.success("Email marked as resolved");
      setIsDetailModalOpen(false);
      onRefresh?.();
      return true;
    } catch (error) {
      toast.error("Failed to mark email as resolved");
      return false;
    }
  };

  const handleOpenReply = (email: Email) => {
    setSelectedEmail(email);
    setReplyContent("");
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyContent.trim()) {
      toast.error("Reply content cannot be empty");
      return false;
    }

    setIsReplying(true);
    try {
      const response = await fetch(`/api/emails/${selectedEmail.id}/reply`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyContent: replyContent.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reply");
      }

      toast.success("Reply sent successfully!");
      setIsReplyModalOpen(false);
      setReplyContent("");
      onRefresh?.();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to send reply");
      return false;
    } finally {
      setIsReplying(false);
    }
  };

  const handleAssignEmail = async (emailId: number, memberId: number) => {
    try {
      if (memberId === 0) {
        const response = await fetch(`/api/emails/${emailId}/assign`, {
          method: "DELETE",
          credentials: 'include',
        });
        if (!response.ok) throw new Error("Failed to unassign email");
        toast.success("Email unassigned successfully!");
        onRefresh?.();
      } else {
        const response = await fetch(`/api/emails/${emailId}/assign`, {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamMemberId: memberId }),
        });
        if (!response.ok) throw new Error("Failed to assign email");
        const data = await response.json();
        toast.success(`Email assigned to ${data.assignedTo.name}!`);
        onRefresh?.();
      }
      return true;
    } catch (error) {
      toast.error("Failed to assign email");
      return false;
    }
  };

  return {
    emails,
    setEmails,
    selectedEmail,
    setSelectedEmail,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isReplyModalOpen,
    setIsReplyModalOpen,
    replyContent,
    setReplyContent,
    isReplying,
    handleViewEmail,
    handleMarkResolved,
    handleOpenReply,
    handleSendReply,
    handleAssignEmail,
  };
}