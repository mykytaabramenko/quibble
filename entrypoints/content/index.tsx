import ReactDOM from 'react-dom/client';
import { log } from '../../src/adapters/insert';
import { getActiveAdapter } from '../../src/adapters/registry';
import { App } from '../../src/ui/App';
import './style.css';

export default defineContentScript({
  // Sites we inject into. New chats are added here and given an adapter.
  matches: [
    'https://gemini.google.com/*',
    'https://chatgpt.com/*',
    'https://chat.openai.com/*',
    'https://claude.ai/*',
  ],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const adapter = getActiveAdapter();
    log('content script loaded on', location.hostname, '— adapter:', adapter?.id ?? 'NONE');
    if (!adapter) return;

    try {
      const ui = await createShadowRootUi(ctx, {
        name: 'quibble-ui',
        position: 'overlay',
        anchor: 'body',
        onMount(container) {
          const root = document.createElement('div');
          root.className = 'cr-root';
          container.append(root);
          const reactRoot = ReactDOM.createRoot(root);
          reactRoot.render(<App adapter={adapter} />);
          return reactRoot;
        },
        onRemove(reactRoot) {
          reactRoot?.unmount();
        },
      });

      ui.mount();
      log('UI mounted');
    } catch (err) {
      log('UI mount failed:', String(err));
    }
  },
});
