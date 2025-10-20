"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: sessionData } = await authClient.getSession();
      console.log("Session data:", sessionData);
      setSession(sessionData);
    } catch (error) {
      console.error("Error checking session:", error);
      toast.error("Error checking session");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: "test@example.com",
        password: "testpassword123",
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message || "Login failed");
        return;
      }

      console.log("Login successful:", data);
      toast.success("Login successful!");
      checkSession();
    } catch (error) {
      console.error("Login exception:", error);
      toast.error("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      console.log("Logout successful");
      toast.success("Logout successful!");
      setSession(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Session Status:</h2>
          {session ? (
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-green-800">✅ Logged in</p>
              <p className="text-sm text-green-700">User: {session.user?.email}</p>
              <p className="text-sm text-green-700">ID: {session.user?.id}</p>
            </div>
          ) : (
            <div className="p-4 bg-red-100 rounded-lg">
              <p className="text-red-800">❌ Not logged in</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Test Login
          </button>

          <button
            onClick={checkSession}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
          >
            Check Session
          </button>

          {session && (
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>

        <div className="mt-6">
          <a href="/login" className="text-blue-500 hover:underline">
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}