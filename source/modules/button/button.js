class Button {
  constructor (element, clickHandler) {
    this._element = element;
    element.addEventListener("click", clickHandler);
  }

  focus () {
    this._element.focus();
  }

  get isFocused () {
    return document.activeElement === this._element;
  }
}
