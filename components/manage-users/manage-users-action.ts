"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import createAdminClient from "@/utils/supabase/admin";

/**
 * Auth admin API response interface
 * Matches the actual Supabase auth admin API response structure
 */
export type AuthAdminResponse = {
  data: {
    user: AuthAdminUser | null;
  };
  error: {
    message: string;
    status?: number;
  } | null;
};

/**
 * Auth admin user response interface
 * Represents the response from adminSupabase.auth.admin.getUserById()
 */
export type AuthAdminUser = {
  id: string;
  email?: string;
  banned_until?: string;
  ban_duration?: string;
  banned_at?: string;
  is_banned?: boolean;
  user_metadata: {
    banned_until?: string;
    ban_duration?: string;
    banned_at?: string;
    is_banned?: boolean;
    role?: string;
    username?: string;
    full_name?: string;
    [key: string]: unknown; // Allow other metadata fields
  };
  [key: string]: unknown; // Allow other auth user properties
};

/**
 * User Profile Interface based on profiles table structure
 * - id: uuid (foreign key to auth.users)
 * - role: 'owner' | 'pegawai'
 * - username: string (unique, min 3 chars)
 * - full_name: string | null
 * - email: string (unique)
 * - created_at: timestamp
 * - updated_at: timestamp
 */
export type User = {
  id: string;
  role: "owner" | "pegawai";
  username: string | null;
  full_name: string | null;
  email: string;
  created_at: string;
  updated_at: string | null;
};

/**
 * Get all users from profiles table
 */
export async function getUsers(): Promise<User[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Gagal mengambil data pengguna");
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw new Error("Terjadi kesalahan saat mengambil data pengguna");
  }
}

/**
 * Add new user to profiles table
 */
export async function addUser(userData: {
  id: string;
  role: "owner" | "pegawai";
  username: string | null;
  full_name: string | null;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  
  try {
    const { error: createError } = await adminSupabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: { role: userData.role, username: userData.username, full_name: userData.full_name },
    });

    if (createError) {
      console.error("Error adding user:", createError);
      return { success: false, error: createError.message };
    }

    const { error: insertError } = await supabase.from("profiles")
        .update({
            role: userData.role,
            username: userData.username,
            full_name: userData.full_name,
            email: userData.email,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userData.id);

    if (insertError) {
      console.error("Error updating user:", insertError);
      return { success: false, error: insertError.message };
    }

    // Revalidate the manage users page
    revalidatePath("/admin/manage-user");

    return { success: true };
  } catch (error) {
    console.error("Error in addUser:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menambahkan pengguna",
    };
  }
}

/**
 * Update user in profiles table
 */
export async function updateUser(
  userId: string,
  userData: {
    role: "owner" | "pegawai";
    username: string | null;
    full_name: string | null;
    email: string;
    password?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();
  const supabase = await createClient();

  try {
    // First, get current user data to compare
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // Check if password or email needs to be updated (not empty)
    const needsEmailUpdate = userData.email && userData.email.trim() !== '';
    const needsPasswordUpdate = userData.password && userData.password.trim() !== '';

    // Update auth admin first if email or password is provided
    if (needsEmailUpdate || needsPasswordUpdate) {
      // Prepare update data for auth admin
      const authUpdateData: {
        email?: string;
        password?: string;
      } = {};

      if (needsEmailUpdate) {
        authUpdateData.email = userData.email;
      }
      if (needsPasswordUpdate) {
        authUpdateData.password = userData.password;
      }

      const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
        userId,
        authUpdateData
      );

      if (updateError) {
        console.error("Error updating user auth:", updateError);
        return { success: false, error: updateError.message };
      }
    }

    // Then update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: userData.role,
        username: userData.username,
        full_name: userData.full_name,
        email: userData.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating user profile:", profileError);
      return { success: false, error: profileError.message };
    }

    // Revalidate the manage users page
    revalidatePath("/admin/manage-user");

    return { success: true };
  } catch (error) {
    console.error("Error in updateUser:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengupdate pengguna",
    };
  }
}

/**
 * Delete user from profiles table
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();

//   const supabase = await createClient();

  try {
    const { error } = await adminSupabase.auth.admin
        .deleteUser(userId)

    if (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: "Gagal menghapus pengguna" };
    }

    revalidatePath("/admin/manage-user");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus pengguna",
    };
  }
}

/**
 * Delete multiple users from profiles table
 */
export async function deleteMultipleUsers(
  userIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();

  console.log("Attempting to delete users with IDs:", userIds);

  try {
    // Delete each user individually using admin auth
    // Since admin API doesn't support bulk delete, we loop through each user
    const deletePromises = userIds.map(async (userId) => {
      const { error } = await adminSupabase.auth.admin.deleteUser(userId);
      if (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
      }
      return userId;
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    console.log("All users deleted successfully");

    revalidatePath("/admin/manage-user");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteMultipleUsers:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus pengguna terpilih",
    };
  }
}

/**
 * Ban user using admin API
 */
export async function banUser(
  userId: string,
  banDuration: string = "100y"
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();

  try {
    const { data: user, error } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { ban_duration: '500000h' }
    )

    if (error) {
      console.error("Error banning user:", error);
      return { success: false, error: "Gagal membanned pengguna" };
    }

    revalidatePath("/admin/manage-user");
    return { success: true };
  } catch (error) {
    console.error("Error in banUser:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat membanned pengguna",
    };
  }
}

/**
 * Unban user using admin API
 */
export async function unbanUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient();

  try {
    // To unban, clear ban information from user_metadata
    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
      // user_metadata: {
      //   is_banned: false,
      //   unbanned_at: new Date().toISOString(),
      //   banned_at: null,    
      // },
    });

    if (error) {
      console.error("Error unbanning user:", error);
      return { success: false, error: "Gagal membuka banned pengguna" };
    }

    revalidatePath("/admin/manage-user");
    return { success: true };
  } catch (error) {
    console.error("Error in unbanUser:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat membuka banned pengguna",
    };
  }
}
/**
 * Get user ban status from auth admin
 */
  export async function getUserBanStatus(userId: string): Promise<{
    isBanned: boolean;
    banDuration?: string;
    error?: string;
  }> {
    const adminSupabase = createAdminClient();

    try {
      const response = await adminSupabase.auth.admin.getUserById(userId) as AuthAdminResponse;
      const { data, error } = response;
      if (error) {
        console.error("Error fetching user ban status:", error);
        return { isBanned: false, error: error.message };
      }

      const user = data.user as AuthAdminUser | null;

      if (!user) {
        return { isBanned: false, error: "User not found" };
      }

      // User is banned if banned_until exists and is in the future
      const bannedUntil = user.banned_until;

      if (bannedUntil == null) {
        return {
          isBanned: false,
          banDuration: undefined,
        };
      }

      // Check if ban has expired
      const banExpiryDate = new Date(bannedUntil);
      const currentDate = new Date();
      const isBanned = banExpiryDate > currentDate;

      return {
        isBanned,
        banDuration: user.user_metadata?.ban_duration || undefined,
      };
    } catch (error) {
      console.error("Error in getUserBanStatus:", error);
      return {
        isBanned: false,
        error: error instanceof Error ? error.message : "Error checking ban status",
      };
    }
  }
/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}
