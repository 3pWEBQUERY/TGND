"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/firebase/storage";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ onImagesUploaded, maxImages = 4 }: ImageUploaderProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ist kein gültiges Bildformat`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} ist größer als 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length + selectedImages.length > maxImages) {
      toast.error(`Du kannst maximal ${maxImages} Bilder hochladen`);
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Vorschaubilder erstellen
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = selectedImages.map(file => 
        uploadImage(file, 'newsfeed-images')
      );

      const results = await Promise.all(uploadPromises);
      const urls = results.map(result => result.url);
      
      onImagesUploaded(urls);
      
      // Zurücksetzen
      setSelectedImages([]);
      setPreviewUrls([]);
      
      toast.success('Bilder erfolgreich hochgeladen');
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      toast.error('Fehler beim Hochladen der Bilder');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative aspect-square">
            <Image
              src={url}
              alt={`Vorschau ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-6 h-6"
              onClick={() => removeImage(index)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      {selectedImages.length < maxImages && (
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          disabled={isUploading}
          className="cursor-pointer"
        />
      )}

      {selectedImages.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Wird hochgeladen...' : 'Bilder hochladen'}
        </Button>
      )}
    </div>
  );
}
