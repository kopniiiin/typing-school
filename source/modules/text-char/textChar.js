class TextChar {
  constructor (requiredChar) {
    this._element = TextChar.template.cloneNode(true);
    
    this._requiredChar = requiredChar;

    this._element.textContent = this._requiredChar;
  }

  type (typedChar) {
    this._typedChar = typedChar;
    
    const isTypedCharCorrect = this._typedChar === this._requiredChar;

    if (isTypedCharCorrect) {
      this._element.classList.add('text-char_correct');
    } else {
      this._element.classList.add('text-char_typo');
      this._element.textContent = this._typedChar;
    }

    this.hideCursor();

    return isTypedCharCorrect;
  }

  erase () {
    const isTypoErased = this._typedChar !== this._requiredChar;

    this._element.classList.remove('text-char_correct', 'text-char_typo');
    this._element.textContent = this._requiredChar;

    this._typedChar = null;

    this.showCursor();

    return isTypoErased;
  }

  showCursor () {
    this._element.classList.add('text-char_cursor');
  }

  hideCursor () {
    this._element.classList.remove('text-char_cursor');
  }

  get element () {
    return this._element;
  }

  get requiredChar () {
    return this._requiredChar;
  }

  get isFull () {
    return Boolean(this._typedChar)
  }
}

TextChar.template = document.querySelector('#template-text-char')
  .content.querySelector('.text-char');
