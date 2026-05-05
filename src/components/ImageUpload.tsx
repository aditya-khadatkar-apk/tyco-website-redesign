import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  bucket?: string;
  folder?: string;
}

export default function ImageUpload({ url, onUpload, bucket = 'media', folder = 'pages' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUpload(data.publicUrl);
    } catch (error: any) {
      setError(error.message);
      console.error('Error uploading image: ', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      
      {url ? (
        <div className="relative inline-block rounded-lg border border-industrial-200 overflow-hidden shadow-sm group">
          <img src={url} alt="Uploaded preview" className="h-48 w-auto object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onUpload('')}
              className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-industrial-300 border-dashed rounded-lg cursor-pointer bg-industrial-50 hover:bg-industrial-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
            ) : (
              <Upload className="w-10 h-10 text-industrial-400 mb-3" />
            )}
            <p className="mb-2 text-sm text-industrial-600">
              <span className="font-semibold">{uploading ? 'Uploading...' : 'Click to upload'}</span> {uploading ? '' : 'or drag and drop'}
            </p>
            <p className="text-xs text-industrial-500">PNG, JPG or WEBP (MAX. 2MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={uploadImage} 
            disabled={uploading} 
          />
        </label>
      )}
    </div>
  );
}
