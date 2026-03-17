interface BaseStore {
  currentMap: string;
}

const rawState: BaseStore = {
  currentMap: "",
};

type Listener = (key: keyof BaseStore, newValue: any) => void;
const listeners: Listener[] = [];

export const useStore = new Proxy(rawState, {
  set(target, property: keyof BaseStore, value) {
    if (target[property] === value) return true;

    target[property] = value;
    console.log(`📦 [状态中心] ${property} 变更为:`, value);

    listeners.forEach((listener) => listener(property, value));

    return true;
  },
});

export function watchStore(callback: Listener) {
  listeners.push(callback);
}
