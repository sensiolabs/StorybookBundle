import {Controller} from '@hotwired/stimulus';
import { getComponent } from '@symfony/ux-live-component';

export default class extends Controller
{
    static targets = ['form'];

    connect() {
        this.componentPromise = getComponent(this.element);
    }

    async submitForm(e) {
        e.preventDefault();

        const component = await this.componentPromise;
        const { value } = component.getData('value');

        setTimeout(async () => {
            component.set('complete', true);
            await component.render();
        }, 100);

        setTimeout(async () => {
            component.set('complete', false);
            await component.render();
        }, 1500);

        this.element.dispatchEvent(new Event('onSuccess', {bubbles: true}));
    }
}
