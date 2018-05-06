const ev = require("event-emitter");
import {Emitter, EmitterMethod} from "event-emitter";

export default abstract class Module implements Emitter {
    private observers: ISelectorObserver[] = [];

    public abstract init();

    public addSelectorObserver(selector: string, callback: SelectorMutationCallback) {
        const observer = {
            selector,
            element: document.querySelector(selector),
            callback,
        };
        if (observer.element) {
            observer.callback(observer.element);
        }
        this.observers.push(observer);
    }

    public onMutation() {
        for (let i = 0; i < this.observers.length; i++) {
            const observer = this.observers[i];
            const element = document.querySelector(observer.selector);
            if (element !== observer.element) {
                observer.element = element;
                observer.callback(element);
            }
        }
    }
    public off: EmitterMethod;
    public on: EmitterMethod;
    public once: EmitterMethod;

    public emit(type: string, ...args: any[]): void {
    }
}

type SelectorMutationCallback = (Element) => void;

interface ISelectorObserver {
    selector: string;
    element: Element;
    callback: SelectorMutationCallback;
}
ev(Module.prototype);
