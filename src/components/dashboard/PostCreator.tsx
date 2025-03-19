"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PostTypeSelector, type PostType } from "@/components/dashboard/PostTypeSelector";
import { MediaUploader, MediaGallery, type MediaItem } from "@/components/dashboard/MediaGallery";
import { PollCreator } from "@/components/dashboard/PollCreator";

interface PostCreatorProps {
  onPostCreated?: (post: any) => void;
}

export function PostCreator({ onPostCreated }: PostCreatorProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("standard");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState("");
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollData, setPollData] = useState<{ question: string; options: string[] } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Funktion zum Hochladen von Medien zu Vercel Blob
  const handleMediaUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Hochladen jeder Datei einzeln und Sammeln der Ergebnisse
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload fehlgeschlagen: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        return {
          id: `blob-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          url: result.url,
          type: result.type as "image" | "video",
          thumbnail: result.type === "video" ? result.url : undefined,
        };
      });
      
      // Warten auf alle Uploads
      const newMedia = await Promise.all(uploadPromises);
      
      setMedia(prev => [...prev, ...newMedia]);
      setShowMediaUploader(false);
    } catch (error) {
      console.error("Fehler beim Hochladen der Medien:", error);
      alert("Fehler beim Hochladen der Medien. Bitte versuche es erneut.");
    } finally {
      setIsUploading(false);
    }
  };

  // Funktion zum Entfernen eines Mediums
  const handleRemoveMedia = (id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
  };

  // Funktion zum Erstellen eines Posts
  const handleCreatePost = async () => {
    if ((!content.trim() && media.length === 0) || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Post erstellen
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          images: media.filter(m => m.type === "image").map(m => m.url),
          videos: media.filter(m => m.type === "video").map(m => m.url),
          type: postType,
          location: location || undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Posts");
      }
      
      const newPost = await response.json();
      
      // Wenn es eine Umfrage gibt, erstelle sie
      if (pollData && postType === "poll") {
        const pollResponse = await fetch("/api/polls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: newPost.id,
            question: pollData.question,
            options: pollData.options,
          }),
        });
        
        if (!pollResponse.ok) {
          console.error("Fehler beim Erstellen der Umfrage");
        } else {
          // Umfrage wurde erfolgreich erstellt, hole den Post mit der Umfrage
          const pollData = await pollResponse.json();
          
          // Füge die Umfrage zum Post hinzu
          newPost.poll = pollData;
        }
      }
      
      // Formular zurücksetzen
      setContent("");
      setMedia([]);
      setLocation("");
      setPollData(null);
      setPostType("standard");
      setShowMediaUploader(false);
      
      // Callback aufrufen, falls vorhanden
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des Posts:", error);
      alert("Fehler beim Erstellen des Posts. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funktion zum automatischen Anpassen der Höhe der Textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={session?.user?.image || ""} 
              alt={session?.user?.name || "User"} 
            />
            <AvatarFallback>
              {(session?.user?.name || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            {/* Post-Typ-Auswahl */}
            <div className="mb-3">
              <PostTypeSelector 
                selectedType={postType} 
                onTypeChange={setPostType} 
              />
            </div>
            
            {/* Textarea für den Post-Inhalt */}
            <Textarea
              ref={textareaRef}
              placeholder={
                postType === "standard" ? "Was gibt es Neues?" :
                postType === "event" ? "Kündige ein Event an..." :
                postType === "availability" ? "Teile deine Verfügbarkeit..." :
                postType === "review" ? "Teile eine Bewertung..." :
                postType === "update" ? "Teile ein Update..." :
                postType === "milestone" ? "Feiere einen Meilenstein..." :
                postType === "offer" ? "Teile ein Angebot..." :
                postType === "poll" ? "Stelle eine Frage..." :
                "Teile deine Reisepläne..."
              }
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                adjustTextareaHeight();
              }}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] resize-none min-h-[100px]"
              onFocus={adjustTextareaHeight}
            />
            
            {/* Medien-Vorschau */}
            {media.length > 0 && (
              <div className="mt-3">
                <MediaGallery 
                  media={media} 
                  editable={true} 
                  onRemove={handleRemoveMedia} 
                  className="aspect-video"
                />
              </div>
            )}
            
            {/* Medien-Uploader */}
            {showMediaUploader && (
              <div className="mt-3">
                <MediaUploader 
                  onUpload={handleMediaUpload} 
                  isUploading={isUploading}
                  maxFiles={10}
                />
              </div>
            )}
            
            {/* Standort-Eingabe (optional) */}
            {(postType === "event" || postType === "travel" || postType === "availability") && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Standort hinzufügen"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)]"
                />
              </div>
            )}
            
            {/* Umfrage-Creator */}
            {showPollCreator && (
              <div className="mt-3 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium mb-3">Umfrage erstellen</h3>
                <PollCreator 
                  onPollCreated={(poll) => {
                    setPollData(poll);
                    setShowPollCreator(false);
                    setContent(`${content ? content + "\n\n" : ""}${poll.question}`);
                  }}
                  onCancel={() => setShowPollCreator(false)}
                />
              </div>
            )}
            
            {/* Umfrage-Vorschau */}
            {pollData && !showPollCreator && (
              <div className="mt-3 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Umfrage-Vorschau</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => setPollData(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                <p className="font-medium mb-2">{pollData.question}</p>
                <div className="space-y-2">
                  {pollData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full border border-gray-400 flex-shrink-0"></div>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Aktionsleiste */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-500 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
                    onClick={() => setShowMediaUploader(!showMediaUploader)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </label>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-500 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
                  onClick={() => {
                    const newLocation = prompt("Standort hinzufügen:");
                    if (newLocation) setLocation(newLocation);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Button>
                
                {postType === "poll" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-500 hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white"
                    onClick={() => setShowPollCreator(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={handleCreatePost}
                disabled={(!content.trim() && media.length === 0) || isSubmitting}
                className="bg-[hsl(345.3,82.7%,40.8%)] hover:bg-[hsl(345.3,82.7%,35%)]"
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
