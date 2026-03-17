export const TaskManager = {
  timers: [] as number[],
  observers: [] as MutationObserver[],

  // 统一添加定时器
  addInterval(fn: Function, ms: number) {
    const id = setInterval(fn, ms);
    this.timers.push(id);
    return id;
  },

  addObserver(
    target: Node,
    config: MutationObserverInit,
    callback: MutationCallback
  ) {
    const obs = new MutationObserver(callback);
    obs.observe(target, config);
    this.observers.push(obs);
    return obs;
  },

  clearAll() {
    this.timers.forEach((id) => clearInterval(id));
    this.timers = [];

    this.observers.forEach((obs) => obs.disconnect());
    this.observers = [];

    console.log("🧹 [大管家] 已清空当前地图的所有定时器和观察者！");
  },
};
