import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  url: string;
  path: string;
}

export async function uploadImage(
  file: File,
  folder: string = 'profile-images'
): Promise<UploadResult> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    // Bild hochladen
    await uploadBytes(storageRef, file);
    
    // Download-URL abrufen
    const url = await getDownloadURL(storageRef);
    
    return { url, path: filePath };
  } catch (error) {
    console.error('Fehler beim Hochladen des Bildes:', error);
    throw new Error('Fehler beim Hochladen des Bildes');
  }
}
