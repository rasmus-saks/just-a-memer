const CHAT_CONTAINER = 'section[data-test-selector="chat-room-component-layout"]';

function getReactInstance(element: HTMLElement): IReactInternalInstance {
    for (const key in element) {
        if (key.startsWith("__reactInternalInstance$")) {
            return element[key];
        }
    }
    return null;
}

function searchReactParents(node, predicate, maxDepth = 15, depth = 0) {
    try {
        const val = predicate(node);
        if (val) {
            return val;
        }
    } catch (_) {
        // Ignored
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

interface IReactInternalInstance extends HTMLElement {
    stateNode?: any;
    return: IReactInternalInstance;
}

interface IChatMessageObject {
    badges: any;
    channel: string;
    id: string;
    message: string;
    timestamp: number;
    user: ({
        color: string,
        isIntl: boolean,
        userDisplayName: string,
        userLogin: string,
        userType: string,
    });
}

export default {
    getChatController() {
        return searchReactParents(
            getReactInstance(document.querySelector(CHAT_CONTAINER)),
            (n) => n.stateNode && n.stateNode.chatBuffer,
        );
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
            // ignored
        }

        return currentChat;
    },

    getChatMessageObject(element): IChatMessageObject {
        const reactInstance = getReactInstance(element);
        return reactInstance && reactInstance.return.stateNode.props.message;
    },

    isDarkTheme(): boolean {
        return document.body.classList.contains("tw-theme--dark");
    },
};
