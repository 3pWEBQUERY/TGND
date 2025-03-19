"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Author {
  id: string;
  name: string;
  image?: string;
  profile?: {
    displayName?: string;
    profileImage?: string;
  };
}

interface Reply {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  _count?: {
    likes: number;
  };
  isLiked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  replies?: Reply[];
  _count: {
    likes: number;
    replies: number;
  };
  isLiked?: boolean;
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
}

export function CommentSection({ 
  postId, 
  initialComments = [], 
  onCommentAdded 
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Funktion zum Laden von Kommentaren
  const loadComments = async (pageNum: number = 1) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments?page=${pageNum}&limit=10`);
      
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Kommentare");
      }
      
      const data = await response.json();
      
      // Verarbeite die Kommentare
      const newComments = data.comments.map((comment: any) => ({
        ...comment,
        isLiked: comment.likes?.length > 0,
      }));
      
      setComments(prev => pageNum === 1 ? newComments : [...prev, ...newComments]);
      setPage(pageNum);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion zum Erstellen eines Kommentars
  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Kommentars");
      }
      
      const comment = await response.json();
      
      // Füge den neuen Kommentar zur Liste hinzu
      const newCommentWithAuthor = {
        ...comment,
        isLiked: false,
      };
      
      setComments(prev => [newCommentWithAuthor, ...prev]);
      
      // Setze das Formular zurück
      setNewComment("");
      
      // Callback aufrufen, falls vorhanden
      if (onCommentAdded) {
        onCommentAdded(newCommentWithAuthor);
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des Kommentars:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funktion zum Erstellen einer Antwort
  const handleCreateReply = async (commentId: string) => {
    if (!replyContent.trim() || !replyingTo) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der Antwort");
      }
      
      const reply = await response.json();
      
      // Füge die neue Antwort zum Kommentar hinzu
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
            _count: {
              ...comment._count,
              replies: comment._count.replies + 1,
              likes: comment._count.likes,
            },
          };
        }
        return comment;
      }));
      
      // Setze das Formular zurück
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Fehler beim Erstellen der Antwort:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funktion zum Liken/Unliken eines Kommentars
  const toggleLikeComment = async (commentId: string, isLiked: boolean) => {
    // Optimistic UI Update
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !isLiked,
          _count: {
            ...comment._count,
            likes: isLiked 
              ? comment._count.likes - 1 
              : comment._count.likes + 1,
          },
        };
      }
      return comment;
    }));

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Liken/Unliken des Kommentars");
      }
    } catch (error) {
      console.error("Fehler beim Liken/Unliken:", error);
      
      // Rückgängig machen des optimistischen Updates bei Fehler
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: isLiked,
            _count: {
              ...comment._count,
              likes: isLiked 
                ? comment._count.likes + 1 
                : comment._count.likes - 1,
            },
          };
        }
        return comment;
      }));
    }
  };

  // Funktion zum Formatieren des Datums
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Funktion zum Anzeigen/Ausblenden von Antworten
  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Funktion zum Anzeigen des Antwortformulars
  const showReplyForm = (commentId: string) => {
    setReplyingTo(commentId);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="mt-4">
      {/* Kommentar-Formular */}
      <div className="flex items-start space-x-3 mb-6">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={session?.user?.image || ""} 
            alt={session?.user?.name || "User"} 
          />
          <AvatarFallback>
            {(session?.user?.name || "U").charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Schreibe einen Kommentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full min-h-[80px] text-sm"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleCreateComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="bg-[hsl(345.3,82.7%,40.8%)] hover:bg-[hsl(345.3,82.7%,35%)]"
            >
              {isSubmitting ? "Wird gesendet..." : "Kommentieren"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Kommentarliste */}
      <div className="space-y-4">
        {comments.length === 0 && !isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Noch keine Kommentare</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Kommentar */}
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={comment.author.profile?.profileImage || comment.author.image || ""} 
                    alt={comment.author.profile?.displayName || comment.author.name || "User"} 
                  />
                  <AvatarFallback>
                    {(comment.author.profile?.displayName || comment.author.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">
                        {comment.author.profile?.displayName || comment.author.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  
                  {/* Kommentar-Aktionen */}
                  <div className="flex items-center space-x-4 mt-1 ml-1">
                    <button 
                      className={`text-xs ${comment.isLiked ? 'text-[hsl(345.3,82.7%,40.8%)]' : 'text-gray-500'}`}
                      onClick={() => toggleLikeComment(comment.id, comment.isLiked || false)}
                    >
                      {comment.isLiked ? 'Gefällt mir nicht mehr' : 'Gefällt mir'} 
                      {comment._count?.likes ? ` (${comment._count.likes})` : ''}
                    </button>
                    <button 
                      className="text-xs text-gray-500"
                      onClick={() => showReplyForm(comment.id)}
                    >
                      Antworten
                    </button>
                    {comment._count?.replies && comment._count.replies > 0 && (
                      <button 
                        className="text-xs text-gray-500"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        {expandedComments[comment.id] 
                          ? 'Antworten ausblenden' 
                          : `${comment._count.replies} Antworten anzeigen`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Antwortformular */}
              {replyingTo === comment.id && (
                <div className="flex items-start space-x-3 ml-10 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={session?.user?.image || ""} 
                      alt={session?.user?.name || "User"} 
                    />
                    <AvatarFallback>
                      {(session?.user?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      ref={textareaRef}
                      placeholder={`Antwort an ${comment.author.profile?.displayName || comment.author.name}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full min-h-[60px] text-sm"
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                        className="hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
                      >
                        Abbrechen
                      </Button>
                      <Button 
                        onClick={() => handleCreateReply(comment.id)}
                        disabled={!replyContent.trim() || isSubmitting}
                        size="sm"
                        className="bg-[hsl(345.3,82.7%,40.8%)] hover:bg-[hsl(345.3,82.7%,35%)]"
                      >
                        {isSubmitting ? "Wird gesendet..." : "Antworten"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Antworten */}
              {expandedComments[comment.id] && comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 space-y-3 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={reply.author.profile?.profileImage || reply.author.image || ""} 
                          alt={reply.author.profile?.displayName || reply.author.name || "User"} 
                        />
                        <AvatarFallback>
                          {(reply.author.profile?.displayName || reply.author.name || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-xs">
                              {reply.author.profile?.displayName || reply.author.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(reply.createdAt)}
                            </p>
                          </div>
                          <p className="text-xs">{reply.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 ml-1">
                          <button 
                            className={`text-xs ${reply.isLiked ? 'text-[hsl(345.3,82.7%,40.8%)]' : 'text-gray-500'}`}
                          >
                            {reply.isLiked ? 'Gefällt mir nicht mehr' : 'Gefällt mir'} 
                            {reply._count?.likes ? ` (${reply._count.likes})` : ''}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Lade-Indikator */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Fehler */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadComments(1)} 
              className="mt-2 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
            >
              Erneut versuchen
            </Button>
          </div>
        )}
        
        {/* Mehr laden */}
        {hasMore && comments.length > 0 && !isLoading && (
          <div className="text-center pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadComments(page + 1)}
              className="hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
            >
              Mehr Kommentare laden
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
