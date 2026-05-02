import type { Database } from '~/types/database';

export const useProfileService = () => {
  const supabase = useSupabaseClient<Database>();
  const { logAction } = useAuditService();

  /**
   * Fetch profile data
   */
  async function getProfileData(id: string, type: 'resident' | 'admin') {
    try {
      const table = type === "admin" ? "admins" : "units";
      const select = type === "admin" ? "id, username, avatar_url" : "id, code, name, avatar_url";

      const { data, error } = await supabase.from(table).select(select).eq("id", id).single();
      if (error) throw error;
      
      const result = { ...data };
      if (type === "admin") {
        (result as any).name = (data as any).username;
        (result as any).code = "ADMIN";
      }

      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Update unit PIN (Residents)
   */
  async function updateUnitPin(unitId: string, oldPin: string, newPin: string) {
    try {
      const { data, error } = await supabase.rpc("update_units_pin", {
        p_units_id: unitId as any,
        p_old_pin: oldPin,
        p_new_pin: newPin,
      });

      if (error) throw error;
      if (data) {
        await logAction('CHANGE_PIN', { type: 'units', id: unitId });
        return { success: true };
      }
      return { success: false, error: "Incorrect current PIN" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Upload profile photo
   */
  async function uploadAvatar(file: File, id: string, type: 'resident' | 'admin') {
    try {
      const table = type === "admin" ? "admins" : "units";
      const { data: current } = await supabase.from(table).select("avatar_url").eq("id", id).single();

      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatar").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatar").getPublicUrl(fileName);

      const { error: updateError } = await supabase.from(table).update({ avatar_url: publicUrl } as any).eq("id", id);
      if (updateError) throw updateError;

      await logAction('UPLOAD_AVATAR', { type: table, id: id }, { filename: fileName });

      // Cleanup old avatar
      if (current?.avatar_url && current.avatar_url.includes("/avatar/")) {
        const oldFileName = current.avatar_url.split("/").pop();
        if (oldFileName && oldFileName !== fileName) {
          await supabase.storage.from("avatar").remove([oldFileName]);
        }
      }

      return { success: true, publicUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Subscribe to profile changes for real-time updates
   */
  function subscribeToProfileChanges(type: 'resident' | 'admin', id: string, onUpdate: (newData: any) => void) {
    const table = type === "admin" ? "admins" : "units";
    
    const channel = supabase
      .channel(`${table}-profile-changes-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: table,
          filter: `id=eq.${id}`,
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  return {
    getProfileData,
    updateUnitPin,
    uploadAvatar,
    subscribeToProfileChanges
  };
};
