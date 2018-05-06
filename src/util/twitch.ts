const REACT_ROOT = "#root div";
const CHAT_CONTAINER = 'section[data-test-selector="chat-room-component-layout"]';
const VOD_CHAT_CONTAINER = ".qa-vod-chat";
const CHAT_LIST = ".chat-list";
const PLAYER = ".player";

function getReactInstance(element) {
    for (const key in element) {
        if (key.startsWith("__reactInternalInstance$")) {
            return element[key];
        }
    }

    return null;
}

function searchReactParents(node, predicate, maxDepth = 15, depth = 0) {
    try {
        if (predicate(node)) {
            return node;
        }
    } catch (_) {
    }

    if (!node || depth > maxDepth) {
        return null;
    }

    const {"return": parent} = node;
    if (parent) {
        return searchReactParents(parent, predicate, maxDepth, depth + 1);
    }

    return null;
}

let currentUser;
let currentChannel;

export default {

    getReactInstance,

    getCurrentChannel() {
        return currentChannel;
    },

    getCurrentUser() {
        return currentUser;
    },

    getConnectStore() {
        let store;
        try {
            const node = searchReactParents(
                getReactInstance(document.querySelector(REACT_ROOT)),
                (n) => n.stateNode && n.stateNode.store,
            );
            store = node.stateNode.store;
        } catch (_) {
        }

        return store;
    },

    getRouter() {
        let router;
        try {
            const node = searchReactParents(
                getReactInstance(document.querySelector(REACT_ROOT)),
                (n) => n.stateNode && n.stateNode.context && n.stateNode.context.router,
            );
            router = node.stateNode.context.router;
        } catch (_) {
        }

        return router;
    },

    getCurrentPlayer() {
        let player;
        try {
            const node = searchReactParents(
                getReactInstance(document.querySelector(PLAYER)),
                (n) => n.stateNode && n.stateNode.player,
            );
            player = node.stateNode;
        } catch (_) {
        }

        return player;
    },

    getChatController() {
        let chatController;
        try {
            const node = searchReactParents(
                getReactInstance(document.querySelector(CHAT_CONTAINER)),
                (n) => n.stateNode && n.stateNode.chatBuffer,
            );
            chatController = node.stateNode;
        } catch (_) {
        }

        return chatController;
    },

    getChatServiceClient() {
        let client;
        try {
            client = this.getChatController().chatService.client;
        } catch (_) {
        }
        return client;
    },

    getChatServiceSocket() {
        let socket;
        try {
            socket = this.getChatServiceClient().connection.ws;
        } catch (_) {
        }
        return socket;
    },

    getChatScroller() {
        let chatScroller;
        try {
            const node = searchReactParents(
                getReactInstance(document.querySelector(CHAT_LIST)),
                (n) => n.stateNode && n.stateNode.props && n.stateNode.scroll,
            );
            chatScroller = node.stateNode;
        } catch (_) {
        }

        return chatScroller;
    },

    getCurrentChat() {
        let currentChat;
        try {
            const node = searchReactParents(
                getReactInstance(document.querySelector(CHAT_CONTAINER)),
                (n) => n.stateNode && n.stateNode.props && n.stateNode.props.onSendMessage,
            );
            currentChat = node.stateNode;
        } catch (_) {
        }

        return currentChat;
    },

    getCurrentVodChat() {
        let currentVodChat;
        try {
            const node = searchReactParents(
                getReactInstance(document.querySelector(VOD_CHAT_CONTAINER)),
                (n) => n.stateNode && n.stateNode.props && n.stateNode.props.data && n.stateNode.props.data.video,
            );
            currentVodChat = node.stateNode;
        } catch (_) {
        }

        return currentVodChat;
    },

    sendChatAdminMessage(body) {
        const chatController = this.getChatController();
        if (!chatController) { return; }

        chatController.chatService.onChatNoticeEvent({
            msgid: Date.now(),
            body,
            channel: `#${chatController.chatService.channelLogin}`,
        });
    },

    sendChatMessage(message) {
        const currentChat = this.getCurrentChat();
        if (!currentChat) { return; }
        currentChat.props.onSendMessage(message);
    },

    getCurrentUserIsModerator() {
        const currentChat = this.getCurrentChat();
        if (!currentChat) { return; }
        return currentChat.props.isCurrentUserModerator;
    },

    getChatMessageObject(element) {
        let msgObject;
        try {
            msgObject = getReactInstance(element).return.stateNode.props.message;
        } catch (_) {
        }

        return msgObject;
    },

    getNodeWithProps(element) {
        let node;
        try {
            node = searchReactParents(
                getReactInstance(element),
                (n) => n.stateNode && n.stateNode.props,
            );
        } catch (_) {
        }

        return node;
    },

    getConversationMessageObject(element) {
        let msgObject;
        try {
            const node = searchReactParents(
                getReactInstance(element),
                (n) => n.stateNode && n.stateNode.props && n.stateNode.props.message,
            );
            msgObject = node.stateNode.props.message;
        } catch (_) {
        }

        return msgObject;
    },

    getChatModeratorCardProps(element) {
        let apolloComponent;
        try {
            const node = searchReactParents(
                getReactInstance(element),
                (n) => n.stateNode && n.stateNode.props && n.stateNode.props.data,
            );
            apolloComponent = node.stateNode.props;
        } catch (_) {
        }

        return apolloComponent;
    },

    getUserIsModeratorFromTagsBadges(badges) {
        if (!badges) { return false; }
        badges = Array.isArray(badges) ? badges.map((b) => b.id) : Object.keys(badges);
        return badges.includes("moderator") ||
            badges.includes("broadcaster") ||
            badges.includes("global_mod") ||
            badges.includes("admin") ||
            badges.includes("staff");
    },

    getUserIsOwnerFromTagsBadges(badges) {
        if (!badges) { return false; }
        badges = Array.isArray(badges) ? badges.map((b) => b.id) : Object.keys(badges);
        return badges.includes("broadcaster") ||
            badges.includes("global_mod") ||
            badges.includes("admin") ||
            badges.includes("staff");
    },

    getCurrentUserIsOwner() {
        const currentChat = this.getCurrentChat();
        if (!currentChat) { return false; }
        return currentChat.props.isOwnChannel || false;
    },

    isDarkTheme() {
        return document.body.classList.contains("tw-theme--dark");
    },
};
