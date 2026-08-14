import DefaultTheme from 'vitepress/theme'
import DocsMapDemo from './DocsMapDemo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DocsMapDemo', DocsMapDemo)
  },
}
