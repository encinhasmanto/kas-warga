<template>
  <div
    class="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-0 md:p-8 relative"
  >
    <!-- Background Pattern (for entire page on desktop) -->
    <div
      class="fixed inset-0 z-0 opacity-[0.03] pointer-events-none hidden md:block"
    >
      <div
        class="absolute inset-0"
        style="
          background-image: radial-gradient(#137fec 1.5px, transparent 1.5px);
          background-size: 32px 32px;
        "
      ></div>
    </div>

    <!-- Responsive Container: Full screen mobile, split 2-col on desktop -->
    <div
      class="w-full h-screen md:h-auto md:max-w-6xl md:bg-white md:dark:bg-slate-900 md:shadow-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row border-0 md:border border-slate-200 dark:border-slate-800 relative z-10"
    >
      <!-- Left Splash Side (Desktop Only) -->
      <div
        class="hidden md:flex flex-1 bg-primary relative items-center justify-center overflow-hidden"
      >
        <div class="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSllj9N16Ievu2ccFGeizvjGM0whc0corvlghJr943DkTOV76DG13wv1R6aRrtvfYCCNnW8qhu40d6jVtp8L_Y40PYPjDnifmnw3y2UgmE7ccRigYwI-s-AMwPkJTyXMpocpUDxYRfyufStlgQXNf3z3_OroOLAex46WVhGTstHzp6u6ARVdArVfNccGoOXB3Uj56tYuB-3pyi2SBuzLDaXJwRIAHfKbnxIVIt7oUrKaumfD-Nm_AUOLBUtbai0iE1dyIQqY_lSQ"
            alt="Building Pattern"
            class="w-full h-full object-cover mix-blend-overlay opacity-20"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"
          ></div>
        </div>
        <div class="relative z-10 p-8 md:p-12 text-white max-w-lg">
          <img
            src="/icons/Logo_Permata_Tajur_Townhouse-alpha1.png"
            alt="Permata Tajur Logo"
            class="mb-6 md:mb-8 drop-shadow-2xl w-[clamp(12rem,18vw,24rem)]"
            style="opacity: 1"
          />
          <h1
            class="font-extrabold tracking-tight mb-4 leading-tight text-[clamp(2.5rem,5vw,3.75rem)]"
          >
            <span style="color: #ba9c6d">KasWarga</span> <br />
            <span
              class="font-bold opacity-90 block mt-2 text-[clamp(1.125rem,2vw,1.5rem)]"
              ><span class="text-[clamp(0.875rem,1.5vw,1.125rem)]">by</span>
              <span style="color: black">Permata Tajur Townhouse</span></span
            >
          </h1>
          <p
            class="text-primary-100 leading-relaxed text-justify opacity-95 text-[clamp(0.875rem,1.5vw,1.125rem)]"
          >
            Selamat datang di KasWarga, pencatatan digital Permata Tajur
            Townhouse. Pencatatan ini dibuat guna kemudahan pemantauan kas
            warga, dana keluar masuk, dan iuran warga, serta informasi perihal
            kegiatan dan proyek warga.
          </p>

          <div
            class="mt-12 flex items-center gap-4 text-sm font-semibold text-white/80"
          >
            <!-- <span class="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md"><span class="material-symbols-outlined text-[16px]">verified_user</span> Secure Login</span>
            <span class="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md"><span class="material-symbols-outlined text-[16px]">speed</span> Realtime Sync</span> -->
          </div>
        </div>
      </div>

      <!-- Right Form Side -->
      <div
        class="w-full md:w-[480px] lg:w-[540px] bg-white dark:bg-slate-900 flex flex-col justify-center h-screen md:h-auto overflow-y-auto no-scrollbar relative z-10"
      >
        <!-- Header / Logo Area (Mobile Centered, Desktop Left-aligned) -->
        <div
          class="pt-12 md:pt-16 pb-6 px-8 md:px-12 flex flex-col md:items-start items-center"
        >
          <div class="md:hidden mb-6">
            <img
              src="/icons/Logo_Permata_Tajur_Townhouse-alpha1.png"
              alt="Tajur Logo"
              class="w-20"
              style="height: 100; width: 100%; opacity: 1"
            />
          </div>
          <h2
            class="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight"
          >
            Sign In
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-base mt-2">
            Enter your Unit Number and PIN.
          </p>
        </div>

        <!-- Form Area -->
        <form
          class="px-8 md:px-12 pb-8 space-y-6"
          @submit.prevent="handleLogin"
        >
          <!-- Unit Selection Dropdown -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >Select Unit or Role</label
            >
            <div class="relative group">
              <select
                v-model="selectedUnit"
                @change="onUnitChange"
                class="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
              >
                <option disabled value="">Choose your unit...</option>
                <optgroup label="Block A">
                  <option v-for="i in 12" :key="'A' + i" :value="'A' + i">
                    A{{ i }}
                  </option>
                </optgroup>
                <optgroup label="Block B">
                  <option v-for="i in 10" :key="'B' + i" :value="'B' + i">
                    B{{ i }}
                  </option>
                </optgroup>
                <optgroup label="Ruko R">
                  <option v-for="i in 11" :key="'R' + i" :value="'R' + i">
                    R{{ i }}
                  </option>
                </optgroup>
                <optgroup label="Management">
                  <option value="Admin">System Administrator</option>
                </optgroup>
              </select>
              <div
                class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400"
              >
                <span class="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <!-- Conditional Admin Input -->
          <div
            class="admin-field-container"
            :class="{ visible: selectedUnit === 'Admin' }"
          >
            <label
              class="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >Admin Username</label
            >
            <div class="relative mt-2">
              <span
                class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl"
                >person</span
              >
              <input
                v-model="adminUsername"
                type="text"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Enter administrator ID"
                autocomplete="username"
              />
            </div>
          </div>

          <!-- PIN Input -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Access PIN</label
              >
              <a
                href="#"
                @click.prevent="handleForgotPin"
                class="text-xs text-primary font-medium hover:underline"
                >Forgot PIN?</a
              >
            </div>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl"
                >lock</span
              >
              <input
                v-model="pin"
                type="password"
                inputmode="numeric"
                maxlength="6"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all tracking-[0.8em] text-center font-bold placeholder:tracking-[0.8em]"
                placeholder="••••••"
                autocomplete="current-password"
              />
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMsg"
            class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center border border-red-100 dark:border-red-800/30"
          >
            {{ errorMsg }}
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Entering..." : "Log In" }}
            <span class="material-symbols-outlined text-xl" v-if="!isLoading"
              >login</span
            >
            <span class="material-symbols-outlined text-xl animate-spin" v-else
              >sync</span
            >
          </button>
        </form>

        <!-- Guest/Demo Section -->
        <div
          class="bg-slate-50 dark:bg-slate-800/50 p-6 md:px-12 border-t border-slate-200 dark:border-slate-800 mt-auto"
        >
          <p
            class="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4"
          >
            Guest Access & Demos
          </p>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="enterGuestMode('Resident')"
              class="flex flex-col items-center justify-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-2 rounded-lg text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span class="material-symbols-outlined text-base text-primary"
                >person_outline</span
              >
              Resident
            </button>
            <button
              @click="enterGuestMode('Admin')"
              class="flex flex-col items-center justify-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-2 rounded-lg text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span class="material-symbols-outlined text-base text-primary"
                >admin_panel_settings</span
              >
              Admin
            </button>
            <button
              @click="enterGuestMode('Super Admin')"
              class="flex flex-col items-center justify-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 px-2 rounded-lg text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span class="material-symbols-outlined text-base text-primary"
                >shield_person</span
              >
              Super
            </button>
          </div>
        </div>

        <!-- Mobile Footer Info -->
        <div class="md:hidden mt-6 pb-6 flex flex-col items-center gap-3">
          <p class="text-[10px] text-slate-400">&copy; 2026 PTTH</p>
        </div>
      </div>
    </div>

    <!-- Demo Not Available Modal -->
    <div
      v-if="showGuestModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showGuestModal = false"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
        @click.stop
      >
        <div class="flex items-center gap-4 mb-4">
          <div
            class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-full flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-3xl">construction</span>
          </div>
          <div>
            <h3
              class="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Demo Unavailable
            </h3>
            <p class="text-xs text-slate-500 font-medium">Under Construction</p>
          </div>
        </div>
        <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">
          Demo or guest mode is currently not available yet. Please check back
          later.
        </p>
        <div class="flex justify-end">
          <button
            @click="showGuestModal = false"
            class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  authenticateResident,
  authenticateAdmin,
} from "@/services/authService.js";
import { useAuth } from "@/composables/useAuth.js";

const router = useRouter();
const { setSession } = useAuth();

const selectedUnit = ref("");
const adminUsername = ref("");
const pin = ref("");
const errorMsg = ref("");
const isLoading = ref(false);
const showGuestModal = ref(false);

function onUnitChange() {
  errorMsg.value = "";
  adminUsername.value = "";
  pin.value = "";
}

function handleForgotPin() {
  if (!selectedUnit.value || selectedUnit.value === "Admin") {
    alert(
      "Mohon pilih Unit tempat tinggal Bapak/Ibu dahulu sebelum menuju Forget PIN.",
    );
  } else {
    const text = encodeURIComponent(
      `${selectedUnit.value} lupa PIN. Tolong dibantu diinfokan untuk akses PINnya. Terima kasih.`,
    );
    window.open(`https://wa.me/6281234967582?text=${text}`, "_blank");
  }
}

async function handleLogin() {
  errorMsg.value = "";

  if (!selectedUnit.value) {
    errorMsg.value = "Please select a unit or role";
    return;
  }
  if (!pin.value) {
    errorMsg.value = "Please enter PIN";
    return;
  }

  isLoading.value = true;

  try {
    let result;

    if (selectedUnit.value === "Admin") {
      if (!adminUsername.value.trim()) {
        errorMsg.value = "Please enter admin username";
        isLoading.value = false;
        return;
      }
      result = await authenticateAdmin(adminUsername.value.trim(), pin.value);
    } else {
      result = await authenticateResident(selectedUnit.value, pin.value);
    }

    if (result.success) {
      // Determine role
      let role = "Resident";
      if (
        result.data.role === "super_admin" ||
        result.data.username?.toLowerCase() === "encin"
      ) {
        role = "Super Admin";
      } else if (
        result.data.role === "admin" ||
        selectedUnit.value === "Admin"
      ) {
        role = "Admin";
      }

      // Save session
      const session = {
        type: selectedUnit.value === "Admin" ? "admin" : "resident",
        id: result.data.id,
        unitCode: selectedUnit.value !== "Admin" ? selectedUnit.value : null,
        username: result.data.username || null,
        displayName:
          result.data.name || result.data.username || selectedUnit.value,
        role,
        isGuest: false,
      };
      setSession(session);

      router.push({ name: "dashboard" });
    } else {
      errorMsg.value = result.error || "Login failed. Check unit and PIN.";
    }
  } catch (err) {
    console.error("Login error:", err);
    errorMsg.value = "An error occurred. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

function enterGuestMode(role) {
  showGuestModal.value = true;
}
</script>

<style scoped>
.admin-field-container {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  overflow: hidden;
  margin-top: 0 !important;
}

.admin-field-container.visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
  margin-top: 20px !important;
}
</style>
