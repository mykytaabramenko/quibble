import ReactDOM from 'react-dom/client';
import { getActiveAdapter } from '../../src/adapters/registry';
import { App } from '../../src/ui/App';
import './style.css';

export default defineContentScript({
  // Sites we inject into. New chats are added here and given an adapter.
  matches: ['https://gemini.google.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const adapter = getActiveAdapter();
    if (!adapter) return;

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
  },
});
