"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SLASetting {
  id: number;
  name: string;
  targetReplyTimeMinutes: number;
  priorityLevel: string;
  isActive: boolean;
  createdAt: string;
}

interface SLASettingsManagerProps {
  onUpdate?: () => void;
}

export function SLASettingsManager({ onUpdate }: SLASettingsManagerProps) {
  const [settings, setSettings] = useState<SLASetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    targetReplyTimeMinutes: 60,
    priorityLevel: "medium",
    isActive: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/sla-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch SLA settings");

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching SLA settings:", error);
      toast.error("Failed to load SLA settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      targetReplyTimeMinutes: 60,
      priorityLevel: "medium",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (setting: SLASetting) => {
    setEditingId(setting.id);
    setFormData({
      name: setting.name,
      targetReplyTimeMinutes: setting.targetReplyTimeMinutes,
      priorityLevel: setting.priorityLevel,
      isActive: setting.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (formData.targetReplyTimeMinutes <= 0) {
      toast.error("Target reply time must be greater than 0");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const url = editingId 
        ? `/api/sla-settings/${editingId}`
        : "/api/sla-settings";
      
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save SLA setting");
      }

      toast.success(editingId ? "SLA setting updated" : "SLA setting created");
      setIsDialogOpen(false);
      fetchSettings();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving SLA setting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save SLA setting");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SLA setting?")) {
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/sla-settings?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete SLA setting");
      }

      toast.success("SLA setting deleted");
      fetchSettings();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting SLA setting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete SLA setting");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/sla-settings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update SLA setting");
      }

      toast.success(`SLA setting ${!currentStatus ? "activated" : "deactivated"}`);
      fetchSettings();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error toggling SLA setting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update SLA setting");
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-600/20";
      case "medium":
        return "text-yellow-400 bg-yellow-600/20";
      case "low":
        return "text-green-400 bg-green-600/20";
      default:
        return "text-gray-400 bg-gray-600/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">SLA Settings</h3>
          <p className="text-purple-300 text-sm mt-1">
            Configure service level agreement response times for different priority levels
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          <Plus size={16} />
          Add SLA
        </button>
      </div>

      {/* Settings Table */}
      {settings.length > 0 ? (
        <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-purple-600/10 border-b border-purple-500/20">
              <tr>
                <th className="text-left px-4 py-3 text-purple-300 text-sm font-semibold">Name</th>
                <th className="text-left px-4 py-3 text-purple-300 text-sm font-semibold">Target Time</th>
                <th className="text-left px-4 py-3 text-purple-300 text-sm font-semibold">Priority</th>
                <th className="text-left px-4 py-3 text-purple-300 text-sm font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-purple-300 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.id} className="border-b border-purple-500/10 hover:bg-purple-600/5 transition-all">
                  <td className="px-4 py-3 text-white font-medium">{setting.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Clock size={14} />
                      {formatTime(setting.targetReplyTimeMinutes)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(setting.priorityLevel)}`}>
                      {setting.priorityLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(setting.id, setting.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        setting.isActive
                          ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                          : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                      }`}
                    >
                      {setting.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(setting)}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-600/20 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(setting.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#1a0f2e]/40 border border-purple-500/10 rounded-lg p-12 text-center">
          <AlertCircle className="text-purple-400 mx-auto mb-4" size={48} />
          <h3 className="text-white font-semibold text-lg mb-2">No SLA Settings</h3>
          <p className="text-purple-300 mb-6">Get started by creating your first SLA configuration</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            <Plus size={16} />
            Add SLA Setting
          </button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#2a1f3d] border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {editingId ? "Edit SLA Setting" : "Create SLA Setting"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-purple-300 text-sm font-semibold mb-2 block">Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Support, Premium Support"
                className="bg-[#1a0f2e] border-purple-500/30 text-white"
              />
            </div>

            {/* Target Reply Time */}
            <div>
              <label className="text-purple-300 text-sm font-semibold mb-2 block">
                Target Reply Time (minutes)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.targetReplyTimeMinutes}
                onChange={(e) => setFormData({ ...formData, targetReplyTimeMinutes: parseInt(e.target.value) || 0 })}
                className="bg-[#1a0f2e] border-purple-500/30 text-white"
              />
              <p className="text-purple-400 text-xs mt-1">
                Current: {formatTime(formData.targetReplyTimeMinutes)}
              </p>
            </div>

            {/* Priority Level */}
            <div>
              <label className="text-purple-300 text-sm font-semibold mb-2 block">Priority Level</label>
              <Select value={formData.priorityLevel} onValueChange={(value) => setFormData({ ...formData, priorityLevel: value })}>
                <SelectTrigger className="bg-[#1a0f2e] border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a1f3d] border-purple-500/30">
                  <SelectItem value="high" className="text-white">High Priority</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium Priority</SelectItem>
                  <SelectItem value="low" className="text-white">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-purple-500/30 bg-[#1a0f2e] text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-purple-300 text-sm font-semibold cursor-pointer">
                Active (applies to new emails immediately)
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-all"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}