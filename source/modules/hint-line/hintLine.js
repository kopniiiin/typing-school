class HintLine {
  constructor () {
    this._element = document.querySelector('.hint-line');
  }

  showHintMessage (hintMessage) {
    this._element.textContent = hintMessage;
    this._element.classList.remove('hint-line_hidden', 'hint-line_warning');
  }

  showWarningMessage (warningMessage) {
    this._element.textContent = warningMessage;
    this._element.classList.add('hint-line_warning')
    this._element.classList.remove('hint-line_hidden');
  }

  hideMessage () {
    this._element.classList.add('hint-line_hidden');
  }
}
