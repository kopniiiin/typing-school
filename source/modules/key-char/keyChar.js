class KeyChar {
  _KEY_SELECTOR = '.key-char__key';

  _CORRECT_CHAR_CLASS = 'key-char_correct';
  _WRONG_CHAR_CLASS = 'key-char_typo';
  _ACTIVE_CHAR_CLASS = 'key-char_cursor';

  constructor (requiredChar) {
    this._element = KeyChar.template.cloneNode(true);

    this._requiredChar = requiredChar;

    this._key = this._element.querySelector(this._KEY_SELECTOR);
    this._key.textContent = this._requiredChar;

    this._typedChar = null;
  }

  type (typedChar) {
    this._typedChar = typedChar;

    let isTypedCharCorrect = this._typedChar === this._requiredChar;

    if (isTypedCharCorrect) {
      this._element.classList.add(this._CORRECT_CHAR_CLASS);
    } else {
      this._element.classList.add(this._WRONG_CHAR_CLASS);
      this._key.textContent = this._typedChar;
    }

    this.hideCursor();

    return isTypedCharCorrect;
  }

  erase () {
    let isTypoErased = this._typedChar !== this._requiredChar;

    this._element.classList.remove(this._CORRECT_CHAR_CLASS, this._WRONG_CHAR_CLASS);

    this._key.textContent = this._requiredChar;

    this._typedChar = null;

    this.showCursor();

    return isTypoErased;
  }

  showCursor () {
    this._element.classList.add(this._ACTIVE_CHAR_CLASS);
  }

  hideCursor () {
    this._element.classList.remove(this._ACTIVE_CHAR_CLASS);
  }

  get element () {
    return this._element;
  }

  get requiredChar () {
    return this._requiredChar;
  }

  get isEmpty () {
    return this._typedChar === null;
  }

  get isFull () {
    return this._typedChar !== null;
  }
}

KeyChar.template = document.querySelector('#template-key-char')
  .content.querySelector('.key-char');
