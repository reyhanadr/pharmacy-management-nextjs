"use client";

import { useState, useRef, useEffect } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { ProfileFormValues } from '@/components/account/profile/profile.schema';

interface AvatarUploadProps {
  initialAvatarUrl: string | null;
  userName: string;
  register: UseFormRegister<ProfileFormValues>;
}

export function AvatarUpload({ initialAvatarUrl, userName, register }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(initialAvatarUrl);
  }, [initialAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const { onChange, ...rest } = register("avatar");

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage 
            src={preview || "/placeholder-user.jpg"} 
            alt={userName || 'User'}
            className="object-cover"
          />
          <AvatarFallback>
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          <span className="sr-only">Unggah foto</span>
        </Button>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          {...rest}
          ref={(e) => {
            rest.ref(e);
            fileInputRef.current = e;
          }}
          onChange={(e) => {
            onChange(e);
            handleFileChange(e);
          }}
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">
          Format JPG, PNG, WEBP atau HEIC.
        </p>
      </div>
    </div>
  );
}