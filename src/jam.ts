import ChatModule from "./module/chat";
import CoreModule from "./module/core";
const core = new CoreModule();
core.registerModule(new ChatModule());
core.init();
