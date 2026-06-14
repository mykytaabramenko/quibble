import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  manifest: {
    name: 'Quibble',
    description:
      'Review AI chat answers like a GitHub PR: select text, comment, and inject quoted fragments back into the prompt.',
    homepage_url: 'https://github.com/mykytaabramenko/quibble',
    // No special permissions needed — everything happens via the injected
    // content script on the chat page itself.
    permissions: [],
  },
});
