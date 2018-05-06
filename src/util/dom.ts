export default function dom(tag, attrs, children) {
    const element = document.createElement(tag);

    for (let name in attrs) {
        if (name && attrs.hasOwnProperty(name)) {
            const value = attrs[name];
            if (value === true) {
                element.setAttribute(name, name);
            } else if (value !== false && value != null) {
                element.setAttribute(name, value.toString());
            }
        }
    }
    for (let i = 2; i < arguments.length; i++) {
        const child = arguments[i];
        element.appendChild(
            child.nodeType == null ?
                document.createTextNode(child.toString()) : child);
    }
    return element;
};
