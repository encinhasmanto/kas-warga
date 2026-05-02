<template>
  <div class="flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary relative z-10">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap items-center gap-1.5 p-2 px-3 border-b bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm relative z-50">
      <button @click.prevent="editor.chain().focus().toggleBold().run()" :class="btnClass('bold')">
        <span class="material-symbols-outlined text-[18px]">format_bold</span>
      </button>
      <button @click.prevent="editor.chain().focus().toggleItalic().run()" :class="btnClass('italic')">
        <span class="material-symbols-outlined text-[18px]">format_italic</span>
      </button>
      <button @click.prevent="editor.chain().focus().toggleBulletList().run()" :class="btnClass('bulletList')">
        <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
      </button>
      <button @click.prevent="editor.chain().focus().toggleOrderedList().run()" :class="btnClass('orderedList')">
        <span class="material-symbols-outlined text-[18px]">format_list_numbered</span>
      </button>
      <button @click.prevent="setLink" :class="btnClass('link')">
        <span class="material-symbols-outlined text-[18px]">link</span>
      </button>
    </div>

    <!-- Surface -->
    <div @click="focusEditor" class="flex-1 overflow-y-auto bg-white dark:bg-slate-900 cursor-text min-h-[250px] max-h-[60vh]">
      <ClientOnly placeholder="Loading Editor...">
        <EditorContent :editor="editor" class="prose prose-slate dark:prose-invert max-w-none p-6 outline-none" />
      </ClientOnly>
    </div>

    <!-- Footer -->
    <footer class="px-6 py-2 bg-slate-50 dark:bg-slate-800/80 border-t flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      <div v-if="editor" class="flex gap-4">
        <span>Words: {{ editor.storage.characterCount.words() }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="isSaving" class="text-primary flex items-center gap-1">
          <span class="material-symbols-outlined animate-spin text-[14px]">refresh</span> Syncing...
        </span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'

const props = defineProps({
  modelValue: { type: String, default: '' },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    CharacterCount
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML())
  }
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy()
})

const focusEditor = () => editor.value?.commands.focus()

const btnClass = (name) => {
  if (!editor.value) return ''
  const active = editor.value.isActive(name)
  return [
    'p-1.5 rounded-lg transition-all flex items-center justify-center',
    active ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
  ]
}

const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().unsetLink().run()
    return
  }
  editor.value.chain().focus().setLink({ href: url }).run()
}
</script>
