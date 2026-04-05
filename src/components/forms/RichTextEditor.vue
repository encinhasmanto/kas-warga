<template>
  <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-visible bg-white dark:bg-slate-900 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary relative z-10">
    <!-- Toolbar Area -->
    <div v-if="editor" class="flex flex-wrap items-center gap-1.5 p-2 px-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-t-2xl relative z-50">
      
      <!-- History -->
      <button @click.prevent="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
        <span class="material-symbols-outlined text-[18px]">undo</span>
      </button>
      <button @click.prevent="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
        <span class="material-symbols-outlined text-[18px]">redo</span>
      </button>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Headings Dropdown -->
      <div class="relative" v-click-outside="() => showHeadingMenu = false">
        <button @click.prevent="showHeadingMenu = !showHeadingMenu" class="px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-semibold transition-colors" :class="isHeadingActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'">
          {{ currentHeadingLabel }}
          <span class="material-symbols-outlined text-[16px] transition-transform" :class="{ 'rotate-180': showHeadingMenu }">expand_more</span>
        </button>
        
        <div v-if="showHeadingMenu" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
          <button @click.prevent="setHeading(null)" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2" :class="{ 'text-primary font-bold': editor.isActive('paragraph') }">
            Normal
          </button>
          <button @click.prevent="setHeading(1)" class="w-full text-left px-4 py-2 text-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2" :class="{ 'text-primary': editor.isActive('heading', { level: 1 }) }">
            Heading 1
          </button>
          <button @click.prevent="setHeading(2)" class="w-full text-left px-4 py-2 text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2" :class="{ 'text-primary': editor.isActive('heading', { level: 2 }) }">
            Heading 2
          </button>
          <button @click.prevent="setHeading(3)" class="w-full text-left px-4 py-2 text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2" :class="{ 'text-primary': editor.isActive('heading', { level: 3 }) }">
            Heading 3
          </button>
        </div>
      </div>

      <!-- Lists Dropdown -->
      <div class="relative" v-click-outside="() => showListMenu = false">
        <button @click.prevent="showListMenu = !showListMenu" class="px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-semibold transition-colors" :class="isListActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'">
          <span class="material-symbols-outlined text-[18px]">{{ currentListIcon }}</span>
          <span class="material-symbols-outlined text-[16px] transition-transform" :class="{ 'rotate-180': showListMenu }">expand_more</span>
        </button>

        <div v-if="showListMenu" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
          <button @click.prevent="toggleList('bullet')" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3" :class="{ 'text-primary bg-primary/5': editor.isActive('bulletList') }">
            <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span> Bullet List
          </button>
          <button @click.prevent="toggleList('ordered')" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3" :class="{ 'text-primary bg-primary/5': editor.isActive('orderedList') }">
            <span class="material-symbols-outlined text-[18px]">format_list_numbered</span> Ordered List
          </button>
          <button @click.prevent="toggleList('task')" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3" :class="{ 'text-primary bg-primary/5': editor.isActive('taskList') }">
            <span class="material-symbols-outlined text-[18px]">checklist</span> Task List
          </button>
        </div>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Formatting -->
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
      <button @click.prevent="editor.chain().focus().toggleHighlight().run()" :class="btnClass('highlight')" title="Highlight">
        <span class="material-symbols-outlined text-[18px]">ink_highlighter</span>
      </button>
      <button @click.prevent="setLink" :class="btnClass('link')" title="Link">
        <span class="material-symbols-outlined text-[18px]">link</span>
      </button>
      
      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <!-- Scripts -->
      <button @click.prevent="editor.chain().focus().toggleSuperscript().run()" :class="btnClass('superscript')" title="Superscript">
        <span class="material-symbols-outlined text-[18px] font-bold">superscript</span>
      </button>
      <button @click.prevent="editor.chain().focus().toggleSubscript().run()" :class="btnClass('subscript')" title="Subscript">
        <span class="material-symbols-outlined text-[18px] font-bold">subscript</span>
      </button>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>

      <!-- Alignment -->
      <div class="hidden sm:flex items-center gap-1">
        <button @click.prevent="editor.chain().focus().setTextAlign('left').run()" :class="alignClass('left')" title="Align Left">
          <span class="material-symbols-outlined text-[18px]">format_align_left</span>
        </button>
        <button @click.prevent="editor.chain().focus().setTextAlign('center').run()" :class="alignClass('center')" title="Align Center">
          <span class="material-symbols-outlined text-[18px]">format_align_center</span>
        </button>
        <button @click.prevent="editor.chain().focus().setTextAlign('right').run()" :class="alignClass('right')" title="Align Right">
          <span class="material-symbols-outlined text-[18px]">format_align_right</span>
        </button>
        <button @click.prevent="editor.chain().focus().setTextAlign('justify').run()" :class="alignClass('justify')" title="Justify">
          <span class="material-symbols-outlined text-[18px]">format_align_justify</span>
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1 ml-auto"></div>

      <!-- Clear Formatting -->
      <button @click.prevent="editor.chain().focus().clearNodes().unsetAllMarks().run()" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Clear Formatting">
        <span class="material-symbols-outlined text-[18px]">format_clear</span>
      </button>
    </div>

    <!-- The actual editor container -->
    <div @click="focusEditor" class="w-full bg-white dark:bg-slate-900 cursor-text rounded-b-2xl overflow-hidden flex flex-col">
      <editor-content :editor="editor" class="prose prose-slate prose-img:rounded-xl dark:prose-invert max-w-none p-4 md:p-6 min-h-[150px] md:min-h-[250px] max-h-[40vh] md:max-h-[50vh] overflow-y-auto outline-none focus:outline-none flex-grow" />
    </div>
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Link from '@tiptap/extension-link'

import { ref, watch, onBeforeUnmount, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const showHeadingMenu = ref(false)
const showListMenu = ref(false)

// Custom directive for clicking outside dropdowns
// (In a real app, you might register this globally. We register a simple version inside the div using standard Vue events on body/window, 
// but for simplicity in setup script, we can just use a click listener on the document)
function closeMenus(e) {
  if (!e.target.closest('.relative')) {
    showHeadingMenu.value = false
    showListMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenus)
})

onUnmounted(() => {
  if (editor.value) {
    // Delay destruction slightly to allow Vue router transition to finish
    // This prevents the 'Cannot read properties of null (reading "parentNode")' error
    setTimeout(() => {
      editor.value.destroy()
    }, 300)
  }
})

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: false,
      underline: false,
    }),
    Underline,
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: 'bg-amber-200 dark:bg-amber-800 rounded px-1',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Superscript,
    Subscript,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline cursor-pointer',
      },
    })
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none',
    },
  },
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML())
  },
})

watch(() => props.modelValue, (value) => {
  const isSame = editor.value.getHTML() === value
  if (isSame) return
  editor.value.commands.setContent(value, false)
})

// UI Helpers
const btnClass = (name) => {
  if (!editor.value) return ''
  const active = name === 'link' 
    ? editor.value.isActive('link') 
    : editor.value.isActive(name)
    
  return [
    'p-1.5 rounded-lg transition-colors flex items-center justify-center', 
    active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
  ]
}

const alignClass = (alignment) => {
  if (!editor.value) return ''
  return [
    'p-1.5 rounded-lg transition-colors flex items-center justify-center', 
    editor.value.isActive({ textAlign: alignment }) ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-inner' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
  ]
}

const isHeadingActive = computed(() => {
  if (!editor.value) return false
  return editor.value.isActive('heading')
})

const currentHeadingLabel = computed(() => {
  if (!editor.value) return 'Normal'
  if (editor.value.isActive('heading', { level: 1 })) return 'H1'
  if (editor.value.isActive('heading', { level: 2 })) return 'H2'
  if (editor.value.isActive('heading', { level: 3 })) return 'H3'
  return 'Normal'
})

const setHeading = (level) => {
  if (level === null) {
    editor.value.chain().focus().setParagraph().run()
  } else {
    editor.value.chain().focus().toggleHeading({ level }).run()
  }
  showHeadingMenu.value = false
}

const isListActive = computed(() => {
  if (!editor.value) return false
  return editor.value.isActive('bulletList') || editor.value.isActive('orderedList') || editor.value.isActive('taskList')
})

const currentListIcon = computed(() => {
  if (!editor.value) return 'format_list_bulleted'
  if (editor.value.isActive('orderedList')) return 'format_list_numbered'
  if (editor.value.isActive('taskList')) return 'checklist'
  return 'format_list_bulleted'
})

const toggleList = (type) => {
  if (type === 'bullet') editor.value.chain().focus().toggleBulletList().run()
  if (type === 'ordered') editor.value.chain().focus().toggleOrderedList().run()
  if (type === 'task') editor.value.chain().focus().toggleTaskList().run()
  showListMenu.value = false
}

const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  
  // simple auto-protocol addition
  let validUrl = url
  if (!validUrl.startsWith('http')) {
    validUrl = 'https://' + validUrl
  }
  
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run()
}

const focusEditor = () => {
  if (editor.value) editor.value.commands.focus()
}

// Simple click-outside directive polyfill for component level since we 
// don't have a global directive registered, just doing it through JS
const vClickOutside = {
  mounted: (el, binding) => {
    el.clickOutsideEvent = event => {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted: el => {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
</script>

<script>
// We need to define standard vue directives before setup block in some older vue build systems,
// but for vue 3 <script setup>, local directives work by prefixing with v
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) {
        binding.value(e)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}
</script>

<style>
/* Styling for Tiptap Editor Content */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
}

ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}

ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-top: 0.2rem;
  user-select: none;
  cursor: pointer;
}

ul[data-type="taskList"] li > label input[type="checkbox"] {
  width: 1.1em;
  height: 1.1em;
  border-radius: 0.25em;
  border: 1px solid #cbd5e1;
  accent-color: #137fec; /* Primary color */
}

ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}

ul[data-type="taskList"] li[data-checked="true"] > div {
  color: #94a3b8;
  text-decoration: line-through;
}
</style>