class Toggle {
  constructor (element) {
    this._element = element;
    this._element.addEventListener('click', this._clickHandler);
  }
  
  toggle () {
    if (this._element.getAttribute('aria-checked') === 'true') {
      this._element.setAttribute('aria-checked', 'false');
    } else {
      this._element.setAttribute('aria-checked', 'true');
    }
  }

  get element () {
    return this._element;
  }

  get isChecked () {
    return this._element.getAttribute('aria-checked') === 'true';
  }

  set disabled (isDisabled) {
    this._element.disabled = isDisabled;
  }

  _clickHandler = () => {
    this.toggle();
  };
}
