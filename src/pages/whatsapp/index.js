"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchWhatsAppConversationThread,
  fetchWhatsAppConversations,
  fetchWhatsAppUniversities,
  sendWhatsAppMessage,
} from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";

function formatWhen(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function WhatsAppInboxContent() {
  const queryClient = useQueryClient();
  const [universityFilter, setUniversityFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState("");
  const threadEndRef = useRef(null);

  const { data: universitiesRes } = useQuery({
    queryKey: ["whatsapp-universities"],
    queryFn: fetchWhatsAppUniversities,
    staleTime: 60 * 1000,
  });

  const universities = useMemo(() => {
    const raw = universitiesRes?.data ?? universitiesRes;
    return Array.isArray(raw) ? raw : [];
  }, [universitiesRes]);

  const { data: listRes, isLoading: listLoading } = useQuery({
    queryKey: ["whatsapp-conversations", universityFilter],
    queryFn: () =>
      fetchWhatsAppConversations({
        page: 1,
        limit: 50,
        university_id: universityFilter || undefined,
      }),
    refetchInterval: 10000,
  });

  const conversations = useMemo(() => {
    const payload = listRes?.data ?? listRes;
    return Array.isArray(payload?.data) ? payload.data : [];
  }, [listRes]);

  const { data: threadRes, isLoading: threadLoading } = useQuery({
    queryKey: ["whatsapp-thread", selectedId],
    queryFn: () => fetchWhatsAppConversationThread(selectedId),
    enabled: Boolean(selectedId),
    refetchInterval: selectedId ? 8000 : false,
  });

  const thread = threadRes?.data ?? threadRes;
  const conversation = thread?.conversation;
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedId]);

  const sendMutation = useMutation({
    mutationFn: () => sendWhatsAppMessage(selectedId, reply),
    onSuccess: () => {
      setReply("");
      notifySuccess("Message sent");
      queryClient.invalidateQueries(["whatsapp-thread", selectedId]);
      queryClient.invalidateQueries(["whatsapp-conversations"]);
    },
    onError: (err) =>
      notifyError(err?.response?.data?.message || "Failed to send message"),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!selectedId || !reply.trim() || sendMutation.isLoading) return;
    sendMutation.mutate();
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">WhatsApp Inbox</h2>
          <p className="text-sm text-muted-foreground">
            All university numbers in one place
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/whatsapp/accounts">Manage Accounts</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUniversityFilter("")}
          className={`px-3 py-1.5 rounded-md text-sm border ${
            !universityFilter
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {universities.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setUniversityFilter(String(u.id))}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              universityFilter === String(u.id)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {u.name}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 border rounded-lg bg-white overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b font-semibold text-sm text-blue-900">
            Conversations
          </div>
          <div className="overflow-y-auto flex-1">
            {listLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No conversations yet. Incoming WhatsApp messages will appear here.
              </p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-3 py-3 border-b hover:bg-blue-50 ${
                    selectedId === c.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-2 items-start">
                    {c.university_logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.university_logo_url}
                        alt=""
                        className="w-8 h-8 rounded object-contain bg-gray-50 border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">
                        {(c.university_name || "?").slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-sm truncate">
                          {c.university_name || "University"}
                        </span>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatWhen(c.last_message_at)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {c.student_phone_number}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {c.last_message_preview || "—"}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 border rounded-lg bg-white overflow-hidden flex flex-col min-h-[420px]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-6">
              Select a conversation to view the thread
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-blue-900">
                    {conversation?.university_name || "Conversation"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Student: {conversation?.student_phone_number || "—"}
                    {conversation?.display_number
                      ? ` · Via ${conversation.display_number}`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {threadLoading ? (
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                ) : (
                  messages.map((m) => {
                    const outbound = m.direction === "outbound";
                    return (
                      <div
                        key={m.id}
                        className={`flex ${outbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm whitespace-pre-wrap break-words ${
                            outbound
                              ? "bg-blue-600 text-white"
                              : "bg-white border text-gray-900"
                          }`}
                        >
                          <div>{m.body}</div>
                          <div
                            className={`text-[10px] mt-1 ${
                              outbound ? "text-blue-100" : "text-muted-foreground"
                            }`}
                          >
                            {formatWhen(m.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={handleSend} className="border-t p-3 flex gap-2 bg-white">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply…"
                  rows={2}
                  className="flex-1 resize-none"
                />
                <Button
                  type="submit"
                  disabled={!reply.trim() || sendMutation.isLoading}
                  className="self-end bg-blue-600 hover:bg-blue-700"
                >
                  {sendMutation.isLoading ? "Sending…" : "Send"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppInboxPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <WhatsAppInboxContent />
    </ProtectedRoute>
  );
}
