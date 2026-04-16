<template>
  <div class="flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary relative z-10">
    
    <!-- Toolbar Area -->
    <div v-if="editor" class="flex flex-wrap items-center gap-1.5 p-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm relative z-50">
      
      <!-- History -->
      <div class="flex items-center gap-1">
        <button @click.prevent="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
          <span class="material-symbols-outlined text-[18px]">undo</span>
        </button>
        <button @click.prevent="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
          <span class="material-symbols-outlined text-[18px]">redo</span>
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Headings Dropdown -->
      <div class="relative" v-click-outside="() => showHeadingMenu = false">
        <button @click.prevent="showHeadingMenu = !showHeadingMenu" class="px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-semibold transition-colors" :class="isHeadingActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'">
          {{ currentHeadingLabel }}
          <span class="material-symbols-outlined text-[16px] transition-transform" :class="{ 'rotate-180': showHeadingMenu }">expand_more</span>
        </button>
        
        <div v-if="showHeadingMenu" class="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-[99]">
          <button @click.prevent="setHeading(null)" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="{ 'text-primary font-bold': editor.isActive('paragraph') }">Normal</button>
          <button v-for="level in [1, 2, 3]" :key="level" @click.prevent="setHeading(level)" class="w-full text-left px-4 py-2 font-bold hover:bg-slate-50 dark:hover:bg-slate-700" :class="[`text-${level === 1 ? 'xl' : level === 2 ? 'lg' : 'base'}`, editor.isActive('heading', { level }) ? 'text-primary' : '']">H{{ level }}</button>
        </div>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Basic Formatting -->
      <div class="flex items-center gap-1">
        <button @click.prevent="editor.chain().focus().toggleBold().run()" :class="btnClass('bold')" title="Bold">
          <span class="material-symbols-outlined text-[18px]">format_bold</span>
        </button>
        <button @click.prevent="editor.chain().focus().toggleItalic().run()" :class="btnClass('italic')" title="Italic">
          <span class="material-symbols-outlined text-[18px]">format_italic</span>
        </button>
        <button @click.prevent="editor.chain().focus().toggleUnderline().run()" :class="btnClass('underline')" title="Underline">
          <span class="material-symbols-outlined text-[18px]">format_underlined</span>
        </button>
        <button @click.prevent="editor.chain().focus().toggleStrike().run()" :class="btnClass('strike')" title="Strikethrough">
          <span class="material-symbols-outlined text-[18px]">format_strikethrough</span>
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Colors & Links -->
      <div class="flex items-center gap-1">
        <button @click.prevent="editor.chain().focus().toggleHighlight().run()" :class="btnClass('highlight')" title="Highlight">
          <span class="material-symbols-outlined text-[18px]">ink_highlighter</span>
        </button>
        <button @click.prevent="setLink" :class="btnClass('link')" title="Link">
          <span class="material-symbols-outlined text-[18px]">link</span>
        </button>
        <input type="file" ref="imageFileInput" accept="image/*" class="hidden" @change="handleImageUpload" />
        <button @click.prevent="triggerImageUpload" :disabled="isUploadingImage" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50" title="Upload Image">
          <span v-if="isUploadingImage" class="material-symbols-outlined text-[18px] animate-spin">refresh</span>
          <span v-else class="material-symbols-outlined text-[18px]">image</span>
        </button>
      </div>
      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Lists -->
      <div class="flex items-center gap-1">
        <button @click.prevent="editor.chain().focus().toggleBulletList().run()" :class="btnClass('bulletList')" title="Bullet List">
          <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
        </button>
        <button @click.prevent="editor.chain().focus().toggleOrderedList().run()" :class="btnClass('orderedList')" title="Ordered List">
          <span class="material-symbols-outlined text-[18px]">format_list_numbered</span>
        </button>
        <button @click.prevent="editor.chain().focus().toggleTaskList().run()" :class="btnClass('taskList')" title="Task List">
          <span class="material-symbols-outlined text-[18px]">checklist</span>
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>

      <!-- Scripts & Misc -->
      <div class="hidden sm:flex items-center gap-1">
        <button @click.prevent="editor.chain().focus().toggleSuperscript().run()" :class="btnClass('superscript')" title="Superscript">
          <span class="material-symbols-outlined text-[18px]">superscript</span>
        </button>
        <button @click.prevent="editor.chain().focus().toggleSubscript().run()" :class="btnClass('subscript')" title="Subscript">
          <span class="material-symbols-outlined text-[18px]">subscript</span>
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Alignments -->
      <div class="flex items-center gap-1">
        <button @click.prevent="editor.chain().focus().setTextAlign('left').run()" :class="alignClass('left')" title="Align Left">
          <span class="material-symbols-outlined text-[18px]">format_align_left</span>
        </button>
        <button @click.prevent="editor.chain().focus().setTextAlign('center').run()" :class="alignClass('center')" title="Align Center">
          <span class="material-symbols-outlined text-[18px]">format_align_center</span>
        </button>
        <button @click.prevent="editor.chain().focus().setTextAlign('right').run()" :class="alignClass('right')" title="Align Right">
          <span class="material-symbols-outlined text-[18px]">format_align_right</span>
        </button>
      </div>

      <!-- Final Actions -->
      <div class="flex items-center gap-1 ml-auto">
        <button @click.prevent="editor.chain().focus().clearNodes().unsetAllMarks().run()" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Clear Formatting">
          <span class="material-symbols-outlined text-[18px]">format_clear</span>
        </button>
      </div>
    </div>

    <!-- Editor Surface -->
    <div @click="focusEditor" class="flex-1 overflow-y-auto bg-white dark:bg-slate-900 cursor-text min-h-[250px] max-h-[60vh]">
      <editor-content :editor="editor" class="prose prose-slate dark:prose-invert max-w-none p-6 outline-none focus:outline-none" />
    </div>

    <!-- Footer Stats & Status -->
    <footer class="px-6 py-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      <div class="flex gap-4" v-if="editor && editor.storage.characterCount">
        <span>Words: {{ editor.storage.characterCount.words() }}</span>
        <span class="hidden sm:inline">Characters: {{ editor.storage.characterCount.characters() }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="isSaving" class="flex items-center gap-1 text-primary">
          <span class="material-symbols-outlined text-[14px] animate-spin">refresh</span> Syncing...
        </span>
        <span v-else-if="lastSaved" class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Saved {{ formatLastSaved(lastSaved) }}
        </span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Link from '@tiptap/extension-link';
import { uploadBulletinImage } from "@/services/bulletinService.js";

const props = defineProps({
  modelValue: { type: String, default: '' },
  isSaving: { type: Boolean, default: false },
  lastSaved: { type: Date, default: null }
});

const emit = defineEmits(['update:modelValue']);

const showHeadingMenu = ref(false);
const imageFileInput = ref(null);
const isUploadingImage = ref(false);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      // Disable these since we add them as standalone extensions with custom config
      link: false,
      underline: false,
    }),
    TiptapImage.configure({
      HTMLAttributes: { class: 'rounded-xl shadow-lg max-w-full my-4 mx-auto block' },
    }),
    Underline,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    CharacterCount,
    Superscript,
    Subscript,
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: { class: 'focus:outline-none' },
  },
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML());
  },
});

watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value, false);
  }
});

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy();
});

const focusEditor = () => { if (editor.value) editor.value.commands.focus(); };

const btnClass = (name) => {
  if (!editor.value) return '';
  const active = name === 'link' ? editor.value.isActive('link') : editor.value.isActive(name);
  return [
    'p-1.5 rounded-lg transition-all flex items-center justify-center',
    active ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
  ];
};

const alignClass = (alignment) => {
  if (!editor.value) return '';
  const active = editor.value.isActive({ textAlign: alignment });
  return [
    'p-1.5 rounded-lg transition-all flex items-center justify-center',
    active ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-200'
  ];
};

const isHeadingActive = computed(() => editor.value?.isActive('heading'));
const currentHeadingLabel = computed(() => {
  if (editor.value?.isActive('heading', { level: 1 })) return 'H1';
  if (editor.value?.isActive('heading', { level: 2 })) return 'H2';
  if (editor.value?.isActive('heading', { level: 3 })) return 'H3';
  return 'Normal';
});

const setHeading = (level) => {
  if (!level) editor.value.chain().focus().setParagraph().run();
  else editor.value.chain().focus().toggleHeading({ level }).run();
  showHeadingMenu.value = false;
};

const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);
  if (url === null) return;
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  let validUrl = url;
  if (!validUrl.startsWith('http')) validUrl = 'https://' + validUrl;
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
};

const triggerImageUpload = () => { imageFileInput.value?.click(); };

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    isUploadingImage.value = true;
    const publicUrl = await uploadBulletinImage(file);
    if (publicUrl && editor.value) {
      editor.value.chain().focus().setImage({ src: publicUrl }).run();
    }
  } catch (error) {
    alert("Upload failed: " + error.message);
  } finally {
    isUploadingImage.value = false;
    event.target.value = '';
  }
};

const formatLastSaved = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const vClickOutside = {
  mounted: (el, binding) => {
    el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(); };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted: (el) => {
    document.removeEventListener('click', el._clickOutside);
  }
};
</script>

<style>
.ProseMirror { outline: none; }
.ProseMirror p { margin: 0.5em 0; }
ul[data-type="taskList"] { list-style: none; padding: 0; }
ul[data-type="taskList"] li { display: flex; gap: 0.5rem; margin: 0.5rem 0; }
ul[data-type="taskList"] input[type="checkbox"] { cursor: pointer; margin-top: 0.25rem; }
.ProseMirror blockquote { border-left: 3.5px solid #e2e8f0; padding-left: 1rem; color: #64748b; font-style: italic; }
.ProseMirror a { color: #137fec; text-decoration: underline; cursor: pointer; }
</style>