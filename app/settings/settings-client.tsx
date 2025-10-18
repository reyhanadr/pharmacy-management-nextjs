'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProfileForm } from "@/components/account/profile/ProfileForm";
import { EmailForm } from "@/components/account/email-form";
import { PasswordForm } from "@/components/account/password/PasswordForm";
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';

// Animasi
import { Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] // easeOutExpo
    }
  }
};

interface Profile {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string | null;
}

interface SettingsClientProps {
  user: User | null;
  profile: Profile | null;
  hasPassword: boolean;
}

export function SettingsClient({ user, profile, hasPassword }: SettingsClientProps) {
  const activeTab = "profile";

  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.main 
        className="flex-1 container mx-auto py-8 px-4 max-w-4xl"
        variants={item}
      >
        <motion.div 
          className="mb-8"
          variants={item}
        >
          <motion.h1 
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Atur Akun Kamu
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Bebas atur semua tentang akunmu di sini! 🎉
          </motion.p>
        </motion.div>

        <motion.div variants={item}>
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CardTitle>Profil Kamu</CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm 
                      initialData={{
                        uid: user?.id ?? undefined,
                        username: profile?.username || user?.email?.split('@')[0] || 'User',
                        name: profile?.display_name || user?.email?.split('@')[0] || 'User',
                        email: user?.email || '',
                        bio: profile?.bio || 'No Bio Yet',
                        avatar: profile?.avatar_url || null,
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="email">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CardTitle>
                        {hasPassword 
                          ? 'Email Kamu' 
                          : 'Bikin Password Dulu ya..'}
                      </CardTitle>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <CardDescription className="text-sm">
                        {hasPassword 
                          ? 'Ganti alamat email utamamu dengan yang baru' 
                          : 'Biar lebih aman, yuk bikin password dulu sebelum mengganti email!'}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <EmailForm 
                      email={user?.email || ''} 
                      hasPasswordProvider={hasPassword}
                    />
                  </CardContent>
                  {!hasPassword && (
                    <CardFooter className="border-t pt-4">
                      <div className="w-full text-center">
                        <TabsList className="inline-flex">
                          <TabsTrigger 
                            value="password" 
                            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors"
                          >
                            🔒 Bikin Password Baru
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="password">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CardTitle>Password Kamu</CardTitle>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <CardDescription>
                        {hasPassword ? 'Bikin password baru yang lebih aman' : 'Kamu belum mengatur password, yuk bikin password buat akunmu'}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <PasswordForm 
                      hasPasswordProvider={hasPassword}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.main>
    </motion.div>
  );
}