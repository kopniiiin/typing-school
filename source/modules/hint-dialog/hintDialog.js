class HintDialog {
  constructor () {
    this._element = document.querySelector('.hint-dialog');
    this._overlay = this._element.querySelector('.hint-dialog__overlay');
    this._message = this._element.querySelector('.hint-dialog__message');
    this._closeButton  = this._element.querySelector('.hint-dialog__close-button');
    
    this._overlay.addEventListener('click', this._overlayClickHandler);
    this._closeButton.addEventListener('click', this._closeButtonClickHandler);
  }

  async showHintMessage (hintMessage) {
    this._element.classList.remove('hint-dialog_hidden');
    this._message.textContent = hintMessage;
    this._closeButton.focus();

    document.addEventListener('keydown', this._keydownHandler);

    return new Promise((resolve => {
      this._closeDialogPromiseResolver = resolve;
    }));
  }

  _close () {
    this._element.classList.add('hint-dialog_hidden');

    document.removeEventListener('keydown', this._keydownHandler);

    this._closeDialogPromiseResolver();
  };

  _manageFocus = () => {
    if (document.activeElement !== this._closeButton) {
      this._closeButton.focus();
    }
  };

  _overlayClickHandler = () => {
    this._close();
  };
  
  _closeButtonClickHandler = () => {
    this._close();  
  };
  
  _keydownHandler = (evt) => {
    if (evt.key === 'Tab') {
      evt.preventDefault();
      this._manageFocus();
    }
    
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this._close();
    }
  };
}
