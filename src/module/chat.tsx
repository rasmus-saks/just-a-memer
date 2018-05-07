import twitch from "../util/twitch";
import Module from "./index";

export default class ChatModule extends Module {
    private static stylePastaPreview(el: HTMLElement) {
        if (twitch.isDarkTheme()) {
            el.style.background = `repeating-linear-gradient(
                45deg,
                #1f1925,
                #1f1925 15px,
                #0e0c13 15px,
                #0e0c13 30px
            )`;
        } else {
            el.style.background = `repeating-linear-gradient(
                45deg,
                #efeef1,
                #efeef1 15px,
                #dfdfdf 15px,
                #dfdfdf 30px
            )`;
        }
        const chatInput = document.querySelector(".chat-input");
        el.style.position = "absolute";
        el.style.bottom = "0";
        el.style.width = chatInput.getBoundingClientRect().width + "px";
        el.style.zIndex = "99999";
    }

    private pastaPreview: HTMLElement;
    private chatObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((el: HTMLElement) => {
                if (!el.classList || !el.classList.contains("chat-line__message")) {
                    return;
                }
                if (this.pastaPreview === el) {
                    return;
                }
                this.onChatMessage(el);
            });
        });
    });

    public init() {
        this.addSelectorObserver(
            '.chat-list__lines > .simplebar-scroll-content > .simplebar-content > [role="log"]', this.chatLogListener);
        this.addSelectorObserver('textarea[data-a-target="chat-input"]', this.textAreaListener);
    }

    private chatLogListener = (el: HTMLElement) => {
        this.chatObserver.disconnect();
        this.chatObserver.observe(el, {
            attributes: false,
            characterData: false,
            childList: true,
            subtree: true,
        });
        const cur = twitch.getChatController().chatService.onChatMessageEvent;

        function wrapper(e) {
            if (!e._pastaPreview && e.sentByCurrentUser) {
                const channel = e.channel;
                const user = e.message.user.username;
                const badges = JSON.stringify(e.message.user.badges || {});
                localStorage.setItem(`JAM:badges-${channel}-${user}`, badges);
            }
            return cur(e);
        }

        twitch.getChatController().chatService.onChatMessageEvent = wrapper;
    }

    private textAreaListener = (el: HTMLTextAreaElement) => {
        el.addEventListener("keyup", () => {
            this.createPastaPreview(el.value);
        });
    }

    private onChatMessage(el: HTMLElement) {
        const msg = twitch.getChatMessageObject(el);
        // Found a pasta preview message
        if (msg.user.userType === "$$PASTA-PREVIEW$$") {
            ChatModule.stylePastaPreview(el);
            if (this.pastaPreview) {
                this.pastaPreview.style.display = "none";
            }
            this.pastaPreview = el;
        }
    }

    private createPastaPreview(text: string) {
        if (text) {
            const currentChat = twitch.getCurrentChat().props;
            const user = currentChat.currentUserLogin;
            const channel = "#" + currentChat.channelLogin;
            const messageEvent = {
                _pastaPreview: true,
                channel,
                message: {
                    body: text,
                    type: 0,
                    user: {
                        badges: JSON.parse(localStorage.getItem(`JAM:badges-${channel}-${user}`)),
                        color: "#FF0000",
                        displayName: currentChat.currentUserDisplayName,
                        userType: "$$PASTA-PREVIEW$$",
                        username: user,
                    },
                },
                sentByCurrentUser: true,
            };
            twitch.getChatController().chatService.onChatMessageEvent(messageEvent);
        } else if (this.pastaPreview) {
            this.pastaPreview.style.display = "none";
            this.pastaPreview = undefined;
        }
    }
}
