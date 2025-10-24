"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Mail, Database } from "lucide-react";

interface EmailDebugInfo {
  id: number;
  subject: string;
  senderEmail: string;
  recipientEmail: string;
  receivedAt: string;
  status: string;
  priority: string;
  hasBodyContent: boolean;
  bodyContentLength: number;
  userId: string;
}

export default function EmailDebugPage() {
  const [emails, setEmails] = useState<EmailDebugInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalInDB, setTotalInDB] = useState<number | null>(null);

  async function loadEmails() {
    setIsLoading(true);
    setError(null);

    try {
      // Get user's emails
      const res = await fetch("/api/tickets/list");
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();

      const debugInfo: EmailDebugInfo[] = data.map((email: any) => ({
        id: email.id,
        subject: email.subject,
        senderEmail: email.senderEmail,
        recipientEmail: email.recipientEmail,
        receivedAt: new Date(email.receivedAt).toLocaleString(),
        status: email.status,
        priority: email.priority,
        hasBodyContent: !!email.bodyContent,
        bodyContentLength: email.bodyContent?.length || 0,
        userId: email.userId,
      }));

      setEmails(debugInfo);

      // Get total count from raw query
      const dbRes = await fetch("/api/debug/email-count");
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setTotalInDB(dbData.totalCount);
      }
    } catch (err) {
      console.error("Error loading emails:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEmails();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Debug Console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all synced emails and their details
          </p>
        </div>
        <Button onClick={loadEmails} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
            <p className="text-xs text-muted-foreground">
              Emails assigned to your account
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in DB</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInDB !== null ? totalInDB : "..."}
            </div>
            <p className="text-xs text-muted-foreground">
              All emails across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With HTML</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emails.filter((e) => e.hasBodyContent).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Emails with body content
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Email List ({emails.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm">
                Sync your email provider in Settings → Email Providers
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          #{email.id}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            email.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : email.status === "replied"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {email.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-muted">
                          {email.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold">{email.subject}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">From:</span>{" "}
                          {email.senderEmail}
                        </p>
                        <p>
                          <span className="font-medium">To:</span>{" "}
                          {email.recipientEmail}
                        </p>
                        <p>
                          <span className="font-medium">Received:</span>{" "}
                          {email.receivedAt}
                        </p>
                        <p>
                          <span className="font-medium">Body:</span>{" "}
                          {email.hasBodyContent
                            ? `${email.bodyContentLength} chars`
                            : "No body content"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
