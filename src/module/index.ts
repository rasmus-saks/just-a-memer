const ev = require("event-emitter");
import {Emitter, EmitterMethod} from "event-emitter";

export default abstract class Module implements Emitter {
    public off: EmitterMethod;
    public on: EmitterMethod;
    public once: EmitterMethod;
    private observers: ISelectorObserver[] = [];

    public abstract init();

    public addSelectorObserver(selector: string, callback: SelectorMutationCallback) {
        const observer = {
            callback,
            element: document.querySelector(selector),
            selector,
        };
        if (observer.element) {
            observer.callback(observer.element);
        }
        this.observers.push(observer);
    }

    public onMutation() {
        for (const observer of this.observers) {
            const element = document.querySelector(observer.selector);
            if (element !== observer.element) {
                observer.element = element;
                observer.callback(element);
            }
        }
    }

    // tslint:disable-next-line:no-empty
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
