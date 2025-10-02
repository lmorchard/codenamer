import mobyDict from './moby_dict.json';

class MobyName extends HTMLElement {
  connectedCallback() {
    this.generateName();
  }

  generateName() {
    const left = mobyDict.left[Math.floor(Math.random() * mobyDict.left.length)];
    const right = mobyDict.right[Math.floor(Math.random() * mobyDict.right.length)];
    this.textContent = `${left}-${right}`;
  }
}

customElements.define('moby-name', MobyName);
