"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCreator } from "@/components/dashboard/PostCreator";
import { CommentSection } from "@/components/dashboard/CommentSection";
import { PollDisplay } from "@/components/dashboard/PollDisplay";

// Typen für den Newsfeed
interface Author {
  id: string;
  name: string;
  email?: string;
  image?: string;
  profile?: {
    displayName?: string;
    profileImage?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  _count: {
    likes: number;
    replies: number;
  };
}

interface Poll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    _count: {
      votes: number;
    };
  }[];
}

interface Post {
  id: string;
  content: string;
  images: string[];
  videos: string[];
  type?: string;
  location?: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  _count: {
    comments: number;
    likes: number;
  };
  likes: { id: string }[];
  isLiked?: boolean;
  poll?: Poll;
}

interface FeedState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

export function NewsFeedContent() {
  const { data: session } = useSession();
  const [feedState, setFeedState] = useState<FeedState>({
    posts: [],
    isLoading: false,
    error: null,
    page: 1,
    hasMore: true,
  });
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("algorithmic");
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (feedState.isLoading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && feedState.hasMore) {
          loadMorePosts();
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [feedState.isLoading, feedState.hasMore]
  );

  // Lade Posts beim ersten Rendern
  useEffect(() => {
    fetchPosts(1);
  }, [activeTab, sortOrder]);

  // Funktion zum Laden weiterer Posts (Infinite Scrolling)
  const loadMorePosts = () => {
    if (!feedState.isLoading && feedState.hasMore) {
      fetchPosts(feedState.page + 1);
    }
  };

  // Funktion zum Abrufen von Posts
  const fetchPosts = async (page: number) => {
    if (page === 1) {
      setFeedState((prev) => ({ ...prev, isLoading: true, error: null }));
    } else {
      setFeedState((prev) => ({ ...prev, isLoading: true }));
    }

    try {
      // Parameter für die API-Anfrage
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort: sortOrder,
      });

      if (activeTab !== "all") {
        params.append("type", activeTab);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Posts");
      }
      
      const data = await response.json();
      
      // Verarbeite die Posts und füge isLiked-Flag hinzu
      const processedPosts = data.posts.map((post: Post) => ({
        ...post,
        isLiked: post.likes.length > 0,
      }));

      setFeedState((prev) => ({
        posts: page === 1 ? processedPosts : [...prev.posts, ...processedPosts],
        isLoading: false,
        error: null,
        page: page,
        hasMore: data.pagination.page < data.pagination.pages,
      }));
    } catch (error) {
      setFeedState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
      }));
    }
  };

  // Funktion zum Erstellen eines neuen Posts
  const createPost = async () => {
    if (!newPostContent.trim()) return;
    
    setIsCreatingPost(true);
    
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPostContent,
          images: [], // Hier könnten später Bilder hinzugefügt werden
        }),
      });
      
      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Posts");
      }
      
      const newPost = await response.json();
      
      // Füge den neuen Post zum Feed hinzu
      setFeedState((prev) => ({
        ...prev,
        posts: [
          {
            ...newPost,
            isLiked: false,
          },
          ...prev.posts,
        ],
      }));
      
      // Setze das Formular zurück
      setNewPostContent("");
    } catch (error) {
      console.error("Fehler beim Erstellen des Posts:", error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Funktion zum Liken/Unliken eines Posts
  const toggleLike = async (postId: string, isLiked: boolean) => {
    // Optimistic UI Update
    setFeedState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !isLiked,
              _count: {
                ...post._count,
                likes: isLiked ? post._count.likes - 1 : post._count.likes + 1,
              },
            }
          : post
      ),
    }));

    try {
      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Liken/Unliken des Posts");
      }
    } catch (error) {
      console.error("Fehler beim Liken/Unliken:", error);
      
      // Rückgängig machen des optimistischen Updates bei Fehler
      setFeedState((prev) => ({
        ...prev,
        posts: prev.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: isLiked,
                _count: {
                  ...post._count,
                  likes: isLiked ? post._count.likes + 1 : post._count.likes - 1,
                },
              }
            : post
        ),
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

  // Render-Funktion für einen einzelnen Post
  const renderPost = (post: Post, isLast: boolean = false) => {
    const ref = isLast ? lastPostElementRef : null;
    
    return (
      <div
        key={post.id}
        ref={ref}
        className="mb-4"
      >
        <Card className="overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center space-x-3 border-b">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={post.author.profile?.profileImage || post.author.image || ""} 
                alt={post.author.profile?.displayName || post.author.name || "User"} 
              />
              <AvatarFallback>
                {(post.author.profile?.displayName || post.author.name || "U").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {post.author.profile?.displayName || post.author.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(post.createdAt)}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </Button>
          </div>
          
          {/* Post Content */}
          <div className="p-4">
            <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
            
            {/* Umfrage anzeigen, wenn es eine gibt und der Post-Typ "poll" ist */}
            {post.type === "poll" && post.poll && (
              <div className="mb-4">
                <PollDisplay 
                  pollId={post.poll.id} 
                  postId={post.id}
                />
              </div>
            )}
            
            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? '' : 'grid-cols-2'}`}>
                {post.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`
                      rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800
                      ${post.images.length === 1 ? 'aspect-video' : 'aspect-square'}
                    `}
                  >
                    <img 
                      src={image} 
                      alt={`Bild ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Post Videos */}
            {post.videos && post.videos.length > 0 && (
              <div className="mb-4">
                {post.videos.map((video, index) => (
                  <div 
                    key={index} 
                    className="rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2 last:mb-0 aspect-video"
                  >
                    <video 
                      src={video} 
                      controls
                      className="w-full h-full object-contain"
                      poster={`${video}?poster=true`}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Post Actions */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => toggleLike(post.id, post.isLiked || false)}
                  className="flex items-center space-x-1 text-sm"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 ${post.isLiked ? 'text-[hsl(345.3,82.7%,40.8%)] fill-[hsl(345.3,82.7%,40.8%)]' : 'text-gray-500'}`} 
                    viewBox="0 0 20 20" 
                    fill={post.isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={post.isLiked ? "0" : "1.5"}
                  >
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                  <span className={post.isLiked ? 'text-[hsl(345.3,82.7%,40.8%)]' : 'text-gray-500'}>
                    {post._count.likes}
                  </span>
                </button>
                
                <button 
                  onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  className="flex items-center space-x-1 text-sm text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post._count.comments}</span>
                </button>
                
                <button className="flex items-center space-x-1 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
              
              <button className="flex items-center space-x-1 text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Comments Preview */}
          {expandedPostId !== post.id && post.comments && post.comments.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-900">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2 mb-2 last:mb-0">
                  <Avatar className="h-6 w-6 mt-0.5">
                    <AvatarImage 
                      src={comment.author.profile?.profileImage || comment.author.image || ""} 
                      alt={comment.author.profile?.displayName || comment.author.name || "User"} 
                    />
                    <AvatarFallback>
                      {(comment.author.profile?.displayName || comment.author.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <p className="font-medium text-xs">
                        {comment.author.profile?.displayName || comment.author.name}
                      </p>
                      <p className="text-xs">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 ml-1">
                      <button className="text-xs text-gray-500">Like</button>
                      <button className="text-xs text-gray-500">Antworten</button>
                      <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="text-xs text-gray-500 mt-2 hover:underline"
                onClick={() => setExpandedPostId(post.id)}
              >
                Alle {post._count.comments} Kommentare anzeigen
              </button>
            </div>
          )}
          
          {/* Full Comment Section */}
          {expandedPostId === post.id && (
            <div className="border-t">
              <div className="p-4">
                <CommentSection 
                  postId={post.id} 
                  initialComments={post.comments.map(comment => ({
                    ...comment,
                    _count: comment._count || {
                      likes: 0,
                      replies: 0
                    }
                  }))}
                  onCommentAdded={(newComment) => {
                    // Aktualisiere den Post mit dem neuen Kommentar
                    setFeedState(prev => ({
                      ...prev,
                      posts: prev.posts.map(p => 
                        p.id === post.id 
                          ? {
                              ...p,
                              comments: [newComment, ...p.comments],
                              _count: {
                                ...p._count,
                                comments: p._count.comments + 1
                              }
                            }
                          : p
                      )
                    }));
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Render-Funktion für Skeleton-Loader
  const renderSkeletonLoader = () => {
    return (
      <div className="mb-4">
        <Card className="overflow-hidden">
          <div className="p-4 flex items-center space-x-3 border-b">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-40 w-full mb-4 rounded-md" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Feed Header mit Tabs und Sortierung */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex overflow-x-auto pb-2 sm:pb-0 space-x-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className={`whitespace-nowrap ${activeTab === "all" ? "bg-[hsl(345.3,82.7%,40.8%)] text-white hover:bg-[hsl(345.3,82.7%,35%)]" : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"}`}
          >
            Alle Beiträge
          </Button>
          <Button
            variant={activeTab === "event" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("event")}
            className={`whitespace-nowrap ${activeTab === "event" ? "bg-[hsl(345.3,82.7%,40.8%)] text-white hover:bg-[hsl(345.3,82.7%,35%)]" : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"}`}
          >
            Events
          </Button>
          <Button
            variant={activeTab === "availability" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("availability")}
            className={`whitespace-nowrap ${activeTab === "availability" ? "bg-[hsl(345.3,82.7%,40.8%)] text-white hover:bg-[hsl(345.3,82.7%,35%)]" : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"}`}
          >
            Verfügbarkeit
          </Button>
          <Button
            variant={activeTab === "offer" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("offer")}
            className={`whitespace-nowrap ${activeTab === "offer" ? "bg-[hsl(345.3,82.7%,40.8%)] text-white hover:bg-[hsl(345.3,82.7%,35%)]" : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"}`}
          >
            Angebote
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={sortOrder === "algorithmic" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortOrder("algorithmic")}
            className={`whitespace-nowrap ${sortOrder === "algorithmic" ? "bg-[hsl(345.3,82.7%,40.8%)] text-white hover:bg-[hsl(345.3,82.7%,35%)]" : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Für dich
          </Button>
          <Button
            variant={sortOrder === "chronological" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortOrder("chronological")}
            className={`whitespace-nowrap ${sortOrder === "chronological" ? "bg-[hsl(345.3,82.7%,40.8%)] text-white hover:bg-[hsl(345.3,82.7%,35%)]" : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Neueste
          </Button>
        </div>
      </div>
      
      {/* Post Creator */}
      <PostCreator 
        onPostCreated={(newPost) => {
          console.log("Neuer Post erstellt:", newPost);
          
          // Stelle sicher, dass der Post alle erforderlichen Felder hat
          const processedPost = {
            ...newPost,
            isLiked: false,
            comments: newPost.comments || [],
            _count: newPost._count || {
              comments: 0,
              likes: 0,
            },
            likes: newPost.likes || [],
          };
          
          setFeedState(prev => ({
            ...prev,
            posts: [
              processedPost,
              ...prev.posts,
            ],
          }));
        }} 
      />
      
      {/* Feed Content */}
      <div>
        {/* Error Message */}
        {feedState.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4">
            <p>{feedState.error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchPosts(1)} 
              className="mt-2"
            >
              Erneut versuchen
            </Button>
          </div>
        )}
        
        {/* Posts */}
        {feedState.posts.length > 0 ? (
          feedState.posts.map((post, index) => 
            renderPost(post, index === feedState.posts.length - 1)
          )
        ) : !feedState.isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Keine Beiträge gefunden</p>
          </div>
        ) : null}
        
        {/* Loading Skeletons */}
        {feedState.isLoading && (
          <>
            {renderSkeletonLoader()}
            {renderSkeletonLoader()}
            {renderSkeletonLoader()}
          </>
        )}
        
        {/* End of Feed */}
        {!feedState.isLoading && !feedState.hasMore && feedState.posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Du hast das Ende erreicht</p>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="mt-2 bg-[hsl(345.3,82.7%,40.8%)] text-white hover:bg-[hsl(345.3,82.7%,35%)]"
            >
              Nach oben scrollen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
