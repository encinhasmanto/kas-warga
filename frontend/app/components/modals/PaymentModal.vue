<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="handleClose"></div>

        <!-- Modal Container -->
        <div class="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 z-10 flex flex-col max-h-[90vh]">
          
          <!-- Header/QR Section -->
          <div class="bg-slate-50 dark:bg-slate-800/50 p-8 flex flex-col items-center shrink-0">
            <div ref="qrContainer" class="bg-white p-4 rounded-3xl shadow-sm mb-5 relative group">
              <qrcode-vue :value="dynamicQrisString" :size="180" level="H" render-as="svg" class="rounded-lg" />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-3xl cursor-pointer" @click="downloadQR">
                <span class="material-symbols-outlined text-primary text-4xl">download</span>
              </div>
            </div>
            
            <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total to Pay</p>
            <h2 class="text-3xl font-black text-slate-900 dark:text-white">
              Rp {{ formatNumber(amountToPay) }}
            </h2>
            
            <button 
              @click="openPartialSelection"
              class="mt-5 px-5 py-2 bg-primary/10 text-primary rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[16px]">checklist</span>
              Customize Selection
            </button>
          </div>

          <!-- Content Section -->
          <div class="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
            <!-- Bank Transfer Info -->
            <div class="bg-slate-100 dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/50 text-center relative group">
              <p class="text-primary font-black text-xs tracking-widest uppercase mb-1">MANDIRI Transfer</p>
              <p class="text-slate-900 dark:text-white font-black text-xl mb-1 tracking-tight">155-00-1585378-4</p>
              <p class="text-[9px] text-slate-500 dark:text-slate-400 uppercase leading-relaxed">
                a.n. YUSRIL ARHAM HASMANTO - <br>TRINADIRA SURYANINGW PRASETYO
              </p>
              <button @click="copyToClipboard('1550015853784')" class="absolute top-4 right-4 text-slate-300 hover:text-primary transition-colors">
                <span class="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>

            <!-- WA Confirmation -->
            <div class="bg-emerald-100 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
              <p class="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium text-center leading-relaxed">
                Confirm your payment with a receipt to: <br/>
                <a href="https://wa.me/6281234967582" target="_blank" class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-300 hover:underline mt-1">
                  <span class="material-symbols-outlined text-[14px]">chat</span>
                  Treasury (Bendahara) - Encin
                </a>
              </p>
            </div>

            <button @click="handleClose" class="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg">
              Dismiss
            </button>
          </div>

          <!-- Partial Selection Slide-up -->
          <transition name="slide-up">
            <div v-if="showPartialModal" class="absolute inset-0 z-20 flex items-end justify-center">
              <!-- Nested Backdrop for selection -->
              <div class="absolute inset-0 bg-slate-900/40" @click="showPartialModal = false"></div>
              
              <div class="relative bg-white dark:bg-slate-900 w-full rounded-t-[2.5rem] shadow-2xl p-6 max-h-[85vh] flex flex-col z-30">
                <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 shrink-0"></div>
                
                <div class="flex justify-between items-center mb-6 shrink-0">
                  <div>
                    <h3 class="font-black text-xl">Select Bills</h3>
                    <p class="text-xs text-slate-500">Choose which items to pay now</p>
                  </div>
                  <button @click="showPartialModal = false" class="size-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div class="overflow-y-auto no-scrollbar pb-6 flex-1">
                  <!-- Due Bills -->
                  <div v-if="dueBills.length > 0" class="mb-8">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      Overdue & Current
                    </h4>
                    <div class="space-y-3">
                      <div v-for="bill in dueBills" :key="bill.id" 
                        class="group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer"
                        :class="selectedIds.includes(bill.id) ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'"
                        @click="toggleBill(bill)"
                      >
                        <div class="flex items-center gap-3">
                          <div class="size-10 rounded-xl flex items-center justify-center transition-colors"
                            :class="selectedIds.includes(bill.id) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'">
                            <span class="material-symbols-outlined text-[20px]">calendar_month</span>
                          </div>
                          <div>
                            <p class="font-bold text-sm leading-tight">{{ bill.label }}</p>
                            <p class="text-xs text-slate-500 mt-0.5">Rp {{ formatNumber(bill.amount) }}</p>
                          </div>
                        </div>
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                          :class="selectedIds.includes(bill.id) ? 'bg-primary border-primary scale-110' : 'border-slate-300 dark:border-slate-600'">
                          <span v-if="selectedIds.includes(bill.id)" class="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Upcoming Bills -->
                  <div v-if="upcomingBills.length > 0">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      Upcoming
                    </h4>
                    <div class="space-y-3 opacity-80">
                      <div v-for="bill in upcomingBills" :key="bill.id" 
                        class="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer"
                        :class="selectedIds.includes(bill.id) ? 'border-primary bg-primary/5 opacity-100' : 'border-slate-100 dark:border-slate-800'"
                        @click="toggleBill(bill)"
                      >
                        <div class="flex items-center gap-3">
                          <div class="size-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                             <span class="material-symbols-outlined text-[20px]">schedule</span>
                          </div>
                          <div>
                            <p class="font-bold text-sm leading-tight text-slate-600 dark:text-slate-300">{{ bill.label }}</p>
                            <p class="text-xs text-slate-400 mt-0.5">Rp {{ formatNumber(bill.amount) }}</p>
                          </div>
                        </div>
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                          :class="selectedIds.includes(bill.id) ? 'bg-primary border-primary scale-110' : 'border-slate-300 dark:border-slate-600'">
                          <span v-if="selectedIds.includes(bill.id)" class="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-6 mt-auto border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <div class="flex justify-between items-center mb-4 px-1">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">Subtotal</p>
                    <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Rp {{ formatNumber(tempAmount) }}</p>
                  </div>
                  <button @click="applySelection" class="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">
                    Update Payment QR
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import QrcodeVue from "qrcode.vue";
import { generateDynamicQRIS } from "~/utils/qrisGenerator";

const props = defineProps({
  isOpen: Boolean,
  unitId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const { getUnitPaymentStatus } = usePaymentService();

// Static QRIS payload (Bank Mandiri)
const STATIC_QRIS_STRING = "00020101021126690021ID.CO.BANKMANDIRI.WWW01189360000802044317790211720443177930303UMI51440014ID.CO.QRIS.WWW0215ID10265010406240303UMI5204701153033605802ID5923Permata Tajur Townhouse6015Tangerang (Kota61051515262070703A016304C473";

const amountToPay = ref(0);
const dynamicQrisString = ref("");
const showPartialModal = ref(false);
const billOptions = ref([]);
const selectedIds = ref([]);
const qrContainer = ref(null);
const isLoading = ref(false);

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Computed properties for categories
const dueBills = computed(() => billOptions.value.filter(b => b.isDue));
const upcomingBills = computed(() => billOptions.value.filter(b => !b.isDue));

const tempAmount = computed(() => {
  return billOptions.value
    .filter(b => selectedIds.value.includes(b.id))
    .reduce((sum, b) => sum + b.amount, 0);
});

async function fetchBills() {
  if (!props.unitId) return;
  isLoading.value = true;
  
  try {
    const res = await getUnitPaymentStatus(props.unitId);
    if (res.success && res.data) {
      const now = new Date();
      const curMonth = now.getMonth() + 1;
      const curYear = now.getFullYear();

      const options = res.data.obligations
        .filter(o => !o.status) // Only unpaid
        .map(o => {
          const isPastYear = o.year < curYear;
          const isCurrentYear = o.year === curYear;
          const isPastMonth = isCurrentYear && o.month <= curMonth;
          const isDue = isPastYear || isPastMonth;

          return {
            id: o.obligation_id,
            label: o.month ? `${monthNames[o.month - 1]} ${o.year}` : `${o.event_name} ${o.year}`,
            amount: o.amount_due,
            isDue: isDue
          };
        });

      billOptions.value = options;
      // Default select all due bills
      selectedIds.value = options.filter(o => o.isDue).map(o => o.id);
      
      updatePaymentTotal();
    }
  } catch (err) {
    console.error("Failed to fetch bills for modal:", err);
  } finally {
    isLoading.value = false;
  }
}

function updatePaymentTotal() {
  amountToPay.value = tempAmount.value;
  if (amountToPay.value > 0) {
    dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, amountToPay.value);
  } else {
    dynamicQrisString.value = STATIC_QRIS_STRING;
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchBills();
  } else {
    showPartialModal.value = false;
    billOptions.value = [];
    selectedIds.value = [];
  }
});

const toggleBill = (bill) => {
  const index = selectedIds.value.indexOf(bill.id);
  if (index > -1) selectedIds.value.splice(index, 1);
  else selectedIds.value.push(bill.id);
};

const applySelection = () => {
  updatePaymentTotal();
  showPartialModal.value = false;
};

const openPartialSelection = () => { showPartialModal.value = true; };
const handleClose = () => { emit("close"); };

function formatNumber(val) {
  return new Intl.NumberFormat('id-ID').format(val);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function downloadQR() {
  const svg = qrContainer.value?.querySelector('svg');
  if (!svg) return;
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // High quality dimensions for the download image
  const width = 1080;
  const height = 1650;
  canvas.width = width;
  canvas.height = height;
  
  // 1. Draw Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  // Helper to load images safely
  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

  Promise.all([
    loadImage('/icons/LogoPermataTajurTownhouse-alpha12.png'),
    loadImage('data:image/svg+xml;base64,' + btoa(svgData)),
  ]).then(([logoImg, qrImg]) => {
    // 1.1 Draw Tiled Watermark (Rotated pattern)
    ctx.save();
    const patternCanvas = document.createElement('canvas');
    const patternSize = 140; // Smaller tiles for closer spacing
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const pctx = patternCanvas.getContext('2d');
    
    pctx.globalAlpha = 0.25; // Increased visibility
    const logoTileSize = patternSize * 0.85; // Fill most of the tile
    pctx.drawImage(logoImg, (patternSize - logoTileSize)/2, (patternSize - logoTileSize)/2, logoTileSize, logoTileSize);
    
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    
    ctx.translate(width / 2, height / 2);
    ctx.rotate(Math.PI / -4); // 45 degrees
    ctx.fillStyle = pattern;
    // Fill large area to cover after rotation
    ctx.fillRect(-width * 1.5, -height * 1.5, width * 3, height * 3);
    ctx.restore();

    // 2. Draw Logo (Top Center)
    const logoWidth = 180;
    const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
    ctx.drawImage(logoImg, (width - logoWidth) / 2, 80, logoWidth, logoHeight);
    
    // 3. Draw Title
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Permata Tajur Townhouse', width / 2, 80 + logoHeight + 60);
    
    // 4. Draw QRIS Section
    const qrSize = 520;
    const borderPadding = 75; // Wide space between QR and border
    const borderRadius = 65; // Very round
    const borderThickness = 18;
    
    const qrX = (width - qrSize) / 2;
    const qrY = 80 + logoHeight + 190;
    
    // Draw Rounded Thicker Border
    ctx.strokeStyle = '#93c5fd'; // blue-300
    ctx.lineWidth = borderThickness;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(
        qrX - borderPadding, 
        qrY - borderPadding, 
        qrSize + (borderPadding * 2), 
        qrSize + (borderPadding * 2), 
        borderRadius
      );
    } else {
      ctx.rect(qrX - borderPadding, qrY - borderPadding, qrSize + (borderPadding * 2), qrSize + (borderPadding * 2));
    }
    ctx.stroke();

    // Process QRIS to make it hollow (remove white background)
    const qrTempCanvas = document.createElement('canvas');
    qrTempCanvas.width = qrImg.width;
    qrTempCanvas.height = qrImg.height;
    const qrCtx = qrTempCanvas.getContext('2d');
    qrCtx.drawImage(qrImg, 0, 0);
    const qrData = qrCtx.getImageData(0, 0, qrTempCanvas.width, qrTempCanvas.height);
    
    for (let i = 0; i < qrData.data.length; i += 4) {
      const r = qrData.data[i];
      const g = qrData.data[i+1];
      const b = qrData.data[i+2];
      // If white or very light gray, make transparent
      if (r > 200 && g > 200 && b > 200) {
        qrData.data[i+3] = 0;
      }
    }
    qrCtx.putImageData(qrData, 0, 0);
    
    // Draw the hollow QRIS
    ctx.drawImage(qrTempCanvas, qrX, qrY, qrSize, qrSize);
    
    // 5. Draw Payment Amount Info
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText('PAYMENT AMOUNT', width / 2, qrY + qrSize + 145);
    
    ctx.fillStyle = '#137fec'; // Primary color
    ctx.font = '900 84px Inter, sans-serif';
    ctx.fillText(`Rp ${formatNumber(amountToPay.value)}`, width / 2, qrY + qrSize + 240);
    
    // 6. Draw Instruction Box
    const boxWidth = 920;
    const boxHeight = 220;
    const boxX = (width - boxWidth) / 2;
    const boxY = qrY + qrSize + 320;
    
    ctx.fillStyle = '#a7f3d0'; // emerald-100
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 32);
    } else {
      ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();
    
    ctx.fillStyle = '#065f46'; // emerald-800
    ctx.font = '500 28px Inter, sans-serif';
    const text = "Untuk update data lebih cepat, segera konfirmasi pembayaran Anda dengan mengirimkan Bukti Pembayaran melalui chat ke Bendahara - Encin.";
    
    // Simple text wrapping
    const words = text.split(' ');
    let line = '';
    let currentY = boxY + 85;
    const maxWidth = 840;
    const lineHeight = 44;
    
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, width / 2, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, currentY);
    
    // 7. Draw "Powered by KasWarga" Footer
    ctx.fillStyle = '#475569'; // slate-500
    ctx.font = '600 24px Inter, sans-serif';
    ctx.fillText('Powered by KasWarga', width / 2, height - 70);
    
    // Final Step: Download
    const link = document.createElement('a');
    link.download = `QRIS-PTTH-${props.unitId}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }).catch(err => {
    console.error("Error generating download image:", err);
  });
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { 
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
}
.slide-up-enter-from, .slide-up-leave-to { 
  transform: translateY(100%);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
