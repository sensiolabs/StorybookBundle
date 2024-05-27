import {Controller} from '@hotwired/stimulus';

export default class extends Controller
{
    onClick() {
        this.element.dispatchEvent(new Event('onClick'));
    }
}
