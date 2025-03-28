"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PostTypeSelector, type PostType } from "@/components/dashboard/PostTypeSelector";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { PollCreator } from "@/components/dashboard/PollCreator";
import { toast } from "sonner";

interface PostCreatorProps {
  onPostCreated?: (post: any) => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("standard");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState("");
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollData, setPollData] = useState<{ question: string; options: string[] } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Funktion zum Erstellen eines Posts
  const handleCreatePost = async () => {
    if ((!content.trim() && imageUrls.length === 0) || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          images: imageUrls,
          type: postType,
          location: location || undefined,
          poll: pollData,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Fehler beim Erstellen des Posts");
      }
      
      const newPost = await response.json();
      
      // Formular zurücksetzen
      setContent("");
      setImageUrls([]);
      setLocation("");
      setPollData(null);
      setShowPollCreator(false);
      setPostType("standard");
      
      // Callback aufrufen
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      toast.success("Post erfolgreich erstellt!");
    } catch (error) {
      console.error("Fehler beim Erstellen des Posts:", error);
      toast.error(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePollSubmit = (question: string, options: string[]) => {
    setPollData({ question, options });
    setShowPollCreator(false);
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              ref={textareaRef}
              placeholder="Was möchtest du teilen?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={url} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Bild ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6"
                      onClick={() => setImageUrls(prev => prev.filter(u => u !== url))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {showPollCreator && (
              <PollCreator onSubmit={handlePollSubmit} onCancel={() => setShowPollCreator(false)} />
            )}
            
            <div className="flex flex-wrap gap-2">
              <PostTypeSelector
                selected={postType}
                onSelect={setPostType}
                onPollCreate={() => setShowPollCreator(true)}
              />
            </div>
            
            <ImageUploader
              onImagesUploaded={(urls) => setImageUrls(prev => [...prev, ...urls])}
              maxImages={4}
            />
            
            <div className="flex justify-end">
              <Button
                onClick={handleCreatePost}
                disabled={(!content.trim() && imageUrls.length === 0) || isSubmitting}
              >
                {isSubmitting ? "Wird gepostet..." : "Posten"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
