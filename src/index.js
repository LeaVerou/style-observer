export default class StyleObserver {
  constructor(callback) {
	this.targets = new Set();
  }

  observe (target) {
	this.targets.add(target);
  }

  unobserve(target) {
	this.targets.delete(target);
  }

  disconnect () {
	this.targets.clear();
  }
}
