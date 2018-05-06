import Module from "./index";

const pipe = require("event-emitter/pipe");

export default class CoreModule extends Module {
    private readonly modules: Module[] = [];
    public init() {
        new MutationObserver(this.mutationObserver)
            .observe(document.body, {
                attributes: false,
                characterData: false,
                childList: true,
                subtree: true,
            });
    }

    public registerModule(module: Module) {
        this.modules.push(module);
        pipe(this, module);
        module.init();
    }

    private mutationObserver = () => {
        for (const module of this.modules) {
            module.onMutation();
        }
    }
}
