import twitch from './util/twitch';

(function () {
    if (window.Jam && window.Jam.loaded) return;
    const mutationConfig = {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true
    };
    let observingChat;
    let txtBox;
    const chatObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(el => {
                if (!el.classList || !el.classList.contains("chat-line__message")) return;
                if (el === pastaPreview) return;
                onChatMessage(el);
            });
        });
    });

    new MutationObserver(() => {
        setupChatObserver();
    }).observe(document.body, mutationConfig);

    function setupChatObserver() {
        const chat = document.querySelector('.chat-list__lines > .simplebar-scroll-content > .simplebar-content > [role="log"]');
        const textBox = document.querySelector("textarea[data-a-target='chat-input']");
        if (textBox && txtBox !== textBox) {
            console.log("Set up textbox listener");
            textBox.addEventListener('keyup', () => {
                createPastaPreview(textBox.value);
            });
            txtBox = textBox;
        }
        if (chat && chat !== observingChat) {
            // Set up chat observer and discard chat loading observer
            console.log("Set up chat observer");
            chatObserver.disconnect();
            chatObserver.observe(chat, mutationConfig);
            observingChat = chat;


            const cur = twitch.getChatController().chatService.onChatMessageEvent;

            function wrapper(e) {
                if (!e._pastaPreview && e.sentByCurrentUser) {
                    const channel = e.channel;
                    const user = e.message.user.username;
                    localStorage.setItem(`JAM:badges-${channel}-${user}`, JSON.stringify(e.message.user.badges || {}));
                }
                return cur(e);
            }

            twitch.getChatController().chatService.onChatMessageEvent = wrapper;
            return true;
        }
        return false;
    }


    function onChatMessage(el) {
        const msg = twitch.getChatMessageObject(el);
        // Found a pasta preview message
        if (msg.user.userType === '$$PASTA-PREVIEW$$') {
            stylePastaPreview(el);
            if (pastaPreview) {
                pastaPreview.style.display = "none";
            }
            pastaPreview = el;
        }
    }

    let pastaPreview;

    function createPastaPreview(text) {
        if (text) {
            const currentChat = twitch.getCurrentChat().props;
            const user = currentChat.currentUserLogin;
            const channel = "#" + currentChat.channelLogin;
            const messageEvent = {
                message: {
                    body: text,
                    user: {
                        badges: JSON.parse(localStorage.getItem(`JAM:badges-${channel}-${user}`)),
                        color: "#FF0000",
                        displayName: currentChat.currentUserDisplayName,
                        username: user,
                        userType: "$$PASTA-PREVIEW$$"
                    },
                    type: 0
                },
                sentByCurrentUser: true,
                channel: channel,
                _pastaPreview: true
            };
            twitch.getChatController().chatService.onChatMessageEvent(messageEvent);
        } else if (pastaPreview) {
            pastaPreview.style.display = "none";
            pastaPreview = undefined;
        }
    }

    function stylePastaPreview(el) {
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

    window.Jam = {
        loaded: true,
        twitch
    };
})();
