class TextLine {
  constructor(text) {
    this._element = TextLine.template.cloneNode(true);

    this._chars = [];

    text.split('').forEach(char => {
      const newChar = new TextChar(char);

      this._chars.push(newChar);
      
      this._element.appendChild(newChar.element);
    });

    this._currentCharIndex = 0;
    this._currentChar = this._chars[this._currentCharIndex];
  }

  type (typedChar) {
    const isTypedCharCorrect = this._currentChar.type(typedChar);

    if (!this.isFull) {
      this._moveCurrentCharForward();
    }

    return isTypedCharCorrect;
  }

  erase () {
    // Если строка полная, то стирается последний символ
    if (!this.isFull) {
      this._moveCurrentCharBackward();
    }

    return this._currentChar.erase();
  }

  showCursor () {
    this._currentChar.showCursor();
  }

  hideCursor () {
    this._currentChar.hideCursor();
  }

  get element () {
    return this._element;
  }

  get requiredChar () {
    return this._currentChar.requiredChar;
  }

  get isEmpty () {
    return !this._currentChar.isFull &&
      this._currentCharIndex === 0;
  }

  get isFull () {
    return this._currentChar.isFull &&
      this._currentCharIndex === this._chars.length - 1;
  }

  get length () {
    return this._chars.length;
  }

  _moveCurrentCharForward () {
    this._currentCharIndex++;
    this._currentChar = this._chars[this._currentCharIndex];
    this._currentChar.showCursor();
  }

  _moveCurrentCharBackward () {
    this._currentChar.hideCursor();
    this._currentCharIndex--;
    this._currentChar = this._chars[this._currentCharIndex];
  }
}

TextLine.template = document.querySelector('#template-text-line')
  .content.querySelector('.text-line');
