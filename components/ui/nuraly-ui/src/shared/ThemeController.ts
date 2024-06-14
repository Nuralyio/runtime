import {ReactiveController, ReactiveControllerHost} from 'lit';

export class ThemeController implements ReactiveController {
  private host: ReactiveControllerHost;
  private themeObserver!: MutationObserver;

  theme = '';

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }
  private configureThemeObserver() {
    const targetNode = document.body;
    const config = {attributes: true};
    const watchThemeAttributeChange = (mutationList: MutationRecord[]) => {
      for (const mutation of mutationList) {
        if (mutation.attributeName == 'data-theme') {
          this.theme = document.body.getAttribute('data-theme')!;
        }
      }
      this.host.requestUpdate();
    };
    this.themeObserver = new MutationObserver(watchThemeAttributeChange);
    this.themeObserver.observe(targetNode, config);
  }

  hostConnected(): void {
    this.configureThemeObserver();
  }

  hostDisconnected(): void {
    this.themeObserver.disconnect();
  }
}
