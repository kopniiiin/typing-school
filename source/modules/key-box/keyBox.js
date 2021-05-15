class KeyBox {
  constructor (text) {
    this._element = KeyBox.template.cloneNode(true);
    
    this._chars = [];

    text.split('').forEach(char => {
      let newChar = new KeyChar(char);

      this._chars.push(newChar);

      this.element.appendChild(newChar.element);
    });

    this._currentCharIndex = 0;
    this._currentChar = this._chars[this._currentCharIndex];
  }

  type (typedChar) {
    let isTypedCharCorrect = this._currentChar.type(typedChar);

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
    return this._currentChar.isEmpty &&
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

KeyBox.template = document.querySelector('#template-key-box')
  .content.querySelector('.key-box');
