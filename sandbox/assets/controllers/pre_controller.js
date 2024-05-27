import {Controller} from '@hotwired/stimulus';

export default class extends Controller {
    static values = {
        style: Object,
    }
    connect()
    {
        Object.assign(this.element.style, this.styleValue);
    }
}
