"use client";

import React, { useState, useMemo } from "react";
import { MessageSquare, Send, Heart, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useBookmarkContext } from "@/context/BookmarkContext";
import { useI18n } from "@/context/I18nContext";
import { sanitizeUserText } from "@/lib/sanitize";

interface ChapterCommentsProps {
  novelId: string;
  chapterId: string;
  chapterNumber: number;
  className?: string;
}

export function ChapterComments({
  novelId,
  chapterId,
  chapterNumber,
  className = "",
}: ChapterCommentsProps) {
  const { getChapterComments, addChapterComment, deleteChapterComment } =
    useBookmarkContext();
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [authorName, setAuthorName] = useState(
    isEn ? "Novel Reader" : "นักอ่านนิรนาม"
  );
  const [commentBody, setCommentBody] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSubmittedTime, setLastSubmittedTime] = useState(0);
  const [rateLimitError, setRateLimitError] = useState("");

  // Retrieve comments for this chapter from context store
  const rawComments = getChapterComments(chapterId);

  // Sort comments
  const sortedComments = useMemo(() => {
    const list = [...rawComments];
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
    return list;
  }, [rawComments, sortOrder]);

  const handleToggleLike = (commentId: string) => {
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      const isLiked = next.has(commentId);
      if (isLiked) {
        next.delete(commentId);
        setLikeCounts((c) => ({ ...c, [commentId]: Math.max(0, (c[commentId] ?? 0) - 1) }));
      } else {
        next.add(commentId);
        setLikeCounts((c) => ({ ...c, [commentId]: (c[commentId] ?? 0) + 1 }));
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSubmittedTime < 3000) {
      setRateLimitError(
        isEn
          ? "Please wait a moment before posting another comment."
          : "กรุณารอสักครู่ก่อนส่งความคิดเห็นถัดไป"
      );
      setTimeout(() => setRateLimitError(""), 3000);
      return;
    }

    const cleaned = sanitizeUserText(commentBody, 500);
    if (!cleaned) return;

    addChapterComment(chapterId, novelId, chapterNumber, cleaned);
    setLastSubmittedTime(now);
    setCommentBody("");
    setRateLimitError("");
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <section
      data-testid="chapter-comments"
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6 my-8 ${className}`}
      aria-label="Chapter comments"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <MessageSquare className="w-4 h-4 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEn ? `Comments (${sortedComments.length})` : `ความคิดเห็น (${sortedComments.length})`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? "Share your thoughts on this chapter" : "พูดคุยแลกเปลี่ยนความรู้สึกเกี่ยวกับตอนนี้"}
            </p>
          </div>
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setSortOrder("newest")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              sortOrder === "newest"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {isEn ? "Newest" : "ล่าสุด"}
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("oldest")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              sortOrder === "oldest"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {isEn ? "Oldest" : "เก่าสุด"}
          </button>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {authorName.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>{isEn ? "Posting as:" : "แสดงความเห็นในชื่อ:"}</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={40}
              className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder={isEn ? "Your name" : "ชื่อของคุณ"}
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none"
            placeholder={
              isEn
                ? "Share your thoughts about this chapter..."
                : "ร่วมแสดงความคิดเห็นเกี่ยวกับตอนนี้..."
            }
          />
          <div className="absolute right-3 bottom-3 text-[11px] font-mono text-slate-400 pointer-events-none">
            {commentBody.length}/500
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {submitSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEn ? "Comment posted" : "โพสต์ความคิดเห็นแล้ว"}</span>
              </span>
            )}
            {rateLimitError && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-medium animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{rateLimitError}</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!commentBody.trim() || commentBody.trim().length > 500}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange-500 text-white transition-all shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isEn ? "Post Comment" : "ส่งความคิดเห็น"}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800/80">
        {sortedComments.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            {isEn
              ? "No comments yet. Be the first to share your thoughts!"
              : "ยังไม่มีความคิดเห็น มาร่วมเป็นคนแรกที่แสดงความคิดเห็นในตอนนี้กันเถอะ"}
          </div>
        ) : (
          sortedComments.map((comment) => {
            const isLiked = likedCommentIds.has(comment.id);
            const displayLikes = (likeCounts[comment.id] ?? 0) + (comment.isSelf ? 0 : 3);

            return (
              <article key={comment.id} className="py-3.5 flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {comment.authorName.charAt(0).toUpperCase() || "U"}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {comment.authorName}
                    </span>

                    {comment.isSelf ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold border border-orange-200 dark:border-orange-800">
                        {isEn ? "You" : "คุณ"}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {isEn ? `Read Ch. ${comment.chapterNumber}` : `อ่านตอนที่ ${comment.chapterNumber}`}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString(
                          isEn ? "en-US" : "th-TH",
                          { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                    {comment.body}
                  </p>

                  {/* Actions (Like / Delete) */}
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id)}
                      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                        isLiked
                          ? "text-rose-600 dark:text-rose-400 font-semibold"
                          : "text-slate-500 dark:text-slate-400 hover:text-rose-500"
                      }`}
                      title={isLiked ? "Unlike" : "Like"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                      <span>{displayLikes > 0 ? displayLikes : ""}</span>
                    </button>

                    {comment.isSelf && (
                      <button
                        type="button"
                        onClick={() => deleteChapterComment(comment.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors ml-auto"
                        title={isEn ? "Delete comment" : "ลบความคิดเห็น"}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="text-[11px]">{isEn ? "Delete" : "ลบ"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
