class TextBox {  
  constructor (texts) {
    this._element = TextBox.template.cloneNode(true);
    
    this._lines = [];
    
    texts.forEach(text => {
      const newLine = new TextLine(text);
      
      this._lines.push(newLine);
      
      newLine.element.classList.add('text-box__text-line');
      this._element.appendChild(newLine.element);
    });

    this._currentLineIndex = 0;
    this._currentLine = this._lines[this._currentLineIndex];

    this._scrollHeight = 0;
  }

  type (typedChar) {
    const isTypedCharCorrect = this._currentLine.type(typedChar);

    if (!this.isFull && this._currentLine.isFull) {
        this._moveCurrentLineForward();
    }

    return isTypedCharCorrect;
  }

  erase () {
    if (this._currentLine.isEmpty) {
      this._moveCurrentLineBackward();
    }

    return this._currentLine.erase();
  }

  showCursor () {
    this._currentLine.showCursor();
  }

  hideCursor () {
    this._currentLine.hideCursor();
  }

  scroll () {
    this._scrollHeight++;

    this._lines.forEach(line => {
      line.element.style.transform = `translateY(${this._scrollHeight * -100}%)`;
    });
  }

  get element () {
    return this._element;
  }

  get requiredChar () {
    return this._currentLine.requiredChar;
  }

  get isEmpty () {
    return this._currentLineIndex === 0 &&
        this._currentLine.isEmpty;
  }

  get isFull () {
    return this._currentLineIndex === this._lines.length - 1 &&
        this._currentLine.isFull;
  }

  get isTimeToScroll () {
    return this._currentLine.isEmpty &&
      this._currentLineIndex > 1 &&
      this._currentLineIndex < this._lines.length - 1;
  }

  get length () {
    return this._lines.reduce((boxLength, lineLength) => {
      return boxLength + lineLength.length;
    }, 0);
  }

  _moveCurrentLineForward () {
    this._currentLineIndex++;
    this._currentLine = this._lines[this._currentLineIndex];
    this._currentLine.showCursor();
  }

  _moveCurrentLineBackward () {
    this._currentLine.hideCursor();
    this._currentLineIndex--;
    this._currentLine = this._lines[this._currentLineIndex];
  }
}

TextBox.template = document.querySelector('#template-text-box')
  .content.querySelector('.text-box');

