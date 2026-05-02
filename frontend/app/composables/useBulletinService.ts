import type { Database } from '~/types/database';

export const useBulletinService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();
  const { logAction } = useAuditService();

  const isAuthorized = computed(() => authStore.isAdmin || authStore.isSuperAdmin);

  /**
   * Upload an image file to Supabase Storage
   */
  async function uploadBulletinImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `bulletins/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("bulletin-assets")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("bulletin-assets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Fetch all bulletins
   */
  async function getBulletins(options: { limit?: number; offset?: number; isPublished?: boolean | null } = {}) {
    try {
      let query = supabase
        .from("bulletins")
        .select("id, title, category, content, content_url, is_published, created_at")
        .order("created_at", { ascending: false });

      if (options.isPublished !== undefined && options.isPublished !== null) {
        query = query.eq("is_published", options.isPublished);
      } else if (!isAuthorized.value) {
        // Default for residents is to only see published bulletins
        query = query.eq("is_published", true);
      }

      const limit = options.limit || 50;
      const offset = options.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error("❌ Error fetching bulletins:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Save a bulletin (Create or Update)
   */
  async function saveBulletin(bulletinData: any) {
    try {
      if (!isAuthorized.value) {
        throw new Error("Unauthorized: Only Admins can save bulletins.");
      }

      const isUpdate = !!bulletinData.id;
      const payload: any = {
        title: bulletinData.title,
        content: bulletinData.content,
        is_published: bulletinData.is_published || false,
        category: bulletinData.category || 'General',
        content_url: bulletinData.content_url || null,
      };

      if (isUpdate) {
        const { data, error } = await supabase
          .from('bulletins')
          .update(payload)
          .eq('id', bulletinData.id)
          .select()
          .single();
          
        if (error) throw error;
        await logAction('UPDATE_BULLETIN', { type: 'bulletins', id: bulletinData.id });
        return { success: true, data };
      } else {
        payload.author_id = authStore.currentUser?.id;
        const { data, error } = await supabase
          .from('bulletins')
          .insert([payload])
          .select()
          .single();
          
        if (error) throw error;
        await logAction('CREATE_BULLETIN', { type: 'bulletins', id: (data as any).id });
        return { success: true, data };
      }
    } catch (err: any) {
      console.error("❌ Error saving bulletin:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a bulletin
   */
  async function deleteBulletin(id: string) {
    try {
      if (!isAuthorized.value) {
        throw new Error("Unauthorized: Only Admins can delete bulletins.");
      }

      const { error } = await supabase.from("bulletins").delete().eq("id", id);
      if (error) throw error;

      await logAction('DELETE_BULLETIN', { type: 'bulletins', id: id });
      return { success: true };
    } catch (err: any) {
      console.error("❌ Error deleting bulletin:", err);
      return { success: false, error: err.message };
    }
  }

  return {
    uploadBulletinImage,
    getBulletins,
    saveBulletin,
    deleteBulletin
  };
};
