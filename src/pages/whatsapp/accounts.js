"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWhatsAppUniversity,
  fetchWhatsAppUniversities,
  updateWhatsAppUniversity,
} from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";

const emptyForm = {
  name: "",
  logo_url: "",
  phone_number_id: "",
  waba_id: "",
  display_number: "",
};

function WhatsAppAccountsContent() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp-universities"],
    queryFn: fetchWhatsAppUniversities,
  });

  const universities = useMemo(() => {
    const raw = data?.data ?? data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        logo_url: form.logo_url.trim() || null,
        phone_number_id: form.phone_number_id.trim(),
        waba_id: form.waba_id.trim(),
        display_number: form.display_number.trim() || null,
      };
      return editingId
        ? updateWhatsAppUniversity(editingId, payload)
        : createWhatsAppUniversity(payload);
    },
    onSuccess: () => {
      notifySuccess(
        editingId
          ? "Account updated"
          : "Account added — phone_number_id is now active for webhook + send"
      );
      setForm(emptyForm);
      setEditingId(null);
      queryClient.invalidateQueries(["whatsapp-universities"]);
    },
    onError: (err) =>
      notifyError(err?.response?.data?.message || "Failed to save account"),
  });

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      logo_url: row.logo_url || "",
      phone_number_id: row.phone_number_id || "",
      waba_id: row.waba_id || "",
      display_number: row.display_number || "",
    });
  };

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-4 space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">WhatsApp Accounts</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            After Meta Embedded Signup for a university, paste its{" "}
            <strong>Phone Number ID</strong> and <strong>WABA ID</strong> here.
            One shared System User token in env covers all numbers.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/whatsapp">Back to Inbox</Link>
        </Button>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-4 shadow-sm">
        <h3 className="font-semibold text-blue-900">
          {editingId ? "Edit university WhatsApp number" : "Add university WhatsApp number"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>University name *</Label>
            <Input value={form.name} onChange={onChange("name")} placeholder="e.g. Amity Online" />
          </div>
          <div className="space-y-1">
            <Label>Display number</Label>
            <Input
              value={form.display_number}
              onChange={onChange("display_number")}
              placeholder="+91 98xxxxxxx"
            />
          </div>
          <div className="space-y-1">
            <Label>Phone Number ID * (from Embedded Signup)</Label>
            <Input
              value={form.phone_number_id}
              onChange={onChange("phone_number_id")}
              placeholder="Meta phone_number_id"
            />
          </div>
          <div className="space-y-1">
            <Label>WABA ID * (from Embedded Signup)</Label>
            <Input
              value={form.waba_id}
              onChange={onChange("waba_id")}
              placeholder="Meta WhatsApp Business Account ID"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Logo URL (optional)</Label>
            <Input
              value={form.logo_url}
              onChange={onChange("logo_url")}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={saveMutation.isLoading}
            onClick={() => {
              if (!form.name.trim() || !form.phone_number_id.trim() || !form.waba_id.trim()) {
                notifyError("Name, Phone Number ID, and WABA ID are required");
                return;
              }
              saveMutation.mutate();
            }}
          >
            {saveMutation.isLoading ? "Saving…" : editingId ? "Update" : "Add account"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b font-semibold text-sm text-blue-900">
          Configured numbers ({universities.length})
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        ) : universities.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No accounts yet. Complete Embedded Signup, then add phone_number_id + waba_id above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2 border-b">Name</th>
                  <th className="px-3 py-2 border-b">Display #</th>
                  <th className="px-3 py-2 border-b">Phone Number ID</th>
                  <th className="px-3 py-2 border-b">WABA ID</th>
                  <th className="px-3 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.display_number || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{u.phone_number_id}</td>
                    <td className="px-3 py-2 font-mono text-xs">{u.waba_id}</td>
                    <td className="px-3 py-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(u)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WhatsAppAccountsPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <WhatsAppAccountsContent />
    </ProtectedRoute>
  );
}
