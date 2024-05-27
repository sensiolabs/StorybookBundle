import {Controller} from '@hotwired/stimulus';
import { getComponent } from '@symfony/ux-live-component';

export default class extends Controller
{
    static targets = ['form'];

    async initialize() {
        this.component = await getComponent(this.element);
    }

    submitForm(e) {
        e.preventDefault();

        const { value } = this.component.getData('value');

        setTimeout(() => {
            this.component.set('complete', true);
            this.component.render();
        }, 500);

        setTimeout(() => {
            this.component.set('complete', false);
            this.component.render();
        }, 1500);

        this.formTarget.dispatchEvent(new Event('onSuccess', {bubbles: true}));
    }
}
