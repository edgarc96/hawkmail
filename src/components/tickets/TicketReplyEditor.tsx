"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Paperclip, Send, AtSign, Hash } from 'lucide-react';

interface TicketReplyEditorProps {
  ticketId: string;
  recipientEmail: string;
  onSubmit: (content: string, attachments?: File[]) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Rich text editor for replying to tickets
 * Features: macros, templates, attachments, markdown preview
 */
export function TicketReplyEditor({
  ticketId,
  recipientEmail,
  onSubmit,
  isSubmitting,
}: TicketReplyEditorProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replyType, setReplyType] = useState<'public' | 'internal'>('public');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onSubmit(content, attachments);
    setContent('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <Tabs value={replyType} onValueChange={(v) => setReplyType(v as 'public' | 'internal')}>
        <div className="border-b border-gray-200 px-4 pt-2">
          <TabsList>
            <TabsTrigger value="public">Public Reply</TabsTrigger>
            <TabsTrigger value="internal">Internal Note</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={replyType} className="p-4 m-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Recipient Info */}
            <div className="text-sm text-gray-600">
              {replyType === 'public' ? (
                <span>Reply to: <strong>{recipientEmail}</strong></span>
              ) : (
                <span className="text-yellow-700">This note will only be visible to agents</span>
              )}
            </div>

            {/* Text Editor */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyType === 'public' ? 'Type your reply...' : 'Add an internal note...'}
              className="min-h-[150px] resize-none"
              disabled={isSubmitting}
            />

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Attachments ({attachments.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded text-sm"
                    >
                      <Paperclip size={14} />
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {/* Attach File */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isSubmitting}
                  />
                  <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>
                    <Paperclip size={16} className="mr-2" />
                    Attach
                  </Button>
                </label>

                {/* TODO: Macros/Templates */}
                <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>
                  <AtSign size={16} className="mr-2" />
                  Macros
                </Button>

                <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>
                  <Hash size={16} className="mr-2" />
                  Templates
                </Button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={!content.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send size={16} className="mr-2" />
                {replyType === 'public' ? 'Send Reply' : 'Add Note'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
