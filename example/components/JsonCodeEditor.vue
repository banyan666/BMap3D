<template>
  <div ref="editorHost" class="json-code-editor" aria-label="地图参数 JSON 编辑器"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { basicSetup, EditorView } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { keymap } from '@codemirror/view'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])
const editorHost = ref(null)
let editorView = null

const consoleTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      color: '#dceff0',
      backgroundColor: '#071521',
      fontSize: '12px',
    },
    '.cm-content': {
      padding: '14px 0 30px',
      caretColor: '#ffb566',
    },
    '.cm-line': {
      padding: '0 18px 0 8px',
    },
    '.cm-scroller': {
      fontFamily: '"Cascadia Code", Consolas, monospace',
      lineHeight: '1.65',
      scrollbarColor: '#315161 transparent',
    },
    '.cm-gutters': {
      color: '#486974',
      border: '0',
      borderRight: '1px solid rgba(120, 181, 194, 0.12)',
      backgroundColor: '#091925',
    },
    '.cm-activeLineGutter': {
      color: '#ffb566',
      backgroundColor: 'rgba(255, 181, 102, 0.05)',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(100, 220, 231, 0.035)',
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(56, 144, 162, 0.38) !important',
    },
    '.cm-cursor': {
      borderLeftColor: '#ffb566',
    },
    '.cm-foldPlaceholder': {
      color: '#91aeb4',
      borderColor: '#294a58',
      backgroundColor: '#102936',
    },
    '.cm-tooltip': {
      color: '#dceff0',
      borderColor: '#294a58',
      backgroundColor: '#0d2330',
    },
    '&.cm-focused': {
      outline: 'none',
    },
  },
  { dark: true },
)

onMounted(() => {
  editorView = new EditorView({
    doc: props.modelValue,
    parent: editorHost.value,
    extensions: [
      basicSetup,
      json(),
      consoleTheme,
      EditorView.lineWrapping,
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            emit('submit')
            return true
          },
        },
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
    ],
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editorView || value === editorView.state.doc.toString()) return
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: value,
      },
    })
  },
)

onBeforeUnmount(() => {
  editorView?.destroy()
  editorView = null
})
</script>
