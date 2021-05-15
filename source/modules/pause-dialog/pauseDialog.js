class PauseDialog {  
  constructor(simulator, keyboard, keyboardSelectDialog) {
    this._element = document.querySelector('.pause-dialog');
    this._overlay = this._element.querySelector('.pause-dialog__overlay');
    this._options = this._element.querySelector('.pause-dialog__options');
    
    this._closeButton = this._element.querySelector('.pause-dialog__close-button');
    this._keyboardButton = this._options.querySelector('.pause-dialog__keyboard-button');
    this._submitButton = this._options.querySelector('.pause-dialog__submit-button');

    this._keyboardToggle = new Toggle(
      this._options.querySelector('.pause-dialog__toggle_keyboard')
    );

    this._handsToggle = new Toggle(
      this._options.querySelector('.pause-dialog__toggle_hands')
    );

    this._simulator = simulator;

    this._keyboard = keyboard;

    this._keyboardSelectDialog = keyboardSelectDialog;

    this._overlay.addEventListener('click', this._overlayClickHandler);
    this._closeButton.addEventListener('click', this._closeButtonClickHandler);
    this._keyboardButton.addEventListener('click', this._keyboardButtonClickHandler);
    this._options.addEventListener('click', this._optionsClickHandler);
    this._options.addEventListener('submit', this._optionsSubmitHandler);

    this._initialOptionVariants = {
      isKeyboardOn: this._simulator.isKeyboardOn,
      areHandsOn: this._keyboard.areHandsOn
    };

    this._setInitialOptionVariants();
  }

  open () {
    this._element.classList.remove('pause-dialog_hidden');

    document.addEventListener('keydown', this._keydownHandler);

    this._closeButton.focus();
    
    return new Promise((resolve => {
      this._closeDialogPromiseResolver = resolve;
    }));
  }
  
  _close = () => {
    this._element.classList.add('pause-dialog_hidden');

    document.removeEventListener('keydown', this._keydownHandler);

    this._setInitialOptionVariants();
  
    this._closeDialogPromiseResolver();
  };

  _setInitialOptionVariants () {
    if (this._keyboardToggle.isChecked !== this._initialOptionVariants.isKeyboardOn) {
      this._keyboardToggle.toggle();
    }

    if (this._handsToggle.isChecked !== this._initialOptionVariants.areHandsOn) {
      this._handsToggle.toggle();
    }

    this._manageAbilityToToggleHands();
    this._manageAbilityToSubmitOptions();
  }
  
  _submitOptions () {
    this._initialOptionVariants = {
      isKeyboardOn: this._keyboardToggle.isChecked,
      areHandsOn: this._handsToggle.isChecked
    };

    if (this._initialOptionVariants.isKeyboardOn !== this._simulator.isKeyboardOn) {
      this._simulator.toggleKeyboard();
    }

    if (this._initialOptionVariants.areHandsOn !== this._keyboard.areHandsOn) {
      this._keyboard.toggleHands();
    }

    this._submitButton.disabled = true;
  }
  
  _manageAbilityToSubmitOptions () {
    this._submitButton.disabled = 
      this._keyboardToggle.isChecked === this._initialOptionVariants.isKeyboardOn &&
      this._handsToggle.isChecked === this._initialOptionVariants.areHandsOn;
  }

  _manageAbilityToToggleHands () {
    this._handsToggle.disabled = !this._keyboardToggle.isChecked;
  }

  _manageFocus = (evt) => {
    let lastFocusableElement = this._submitButton.disabled ?
        this._keyboardButton : this._submitButton;

    if (evt.shiftKey) {
      if (document.activeElement === this._closeButton) {
        evt.preventDefault();
        lastFocusableElement.focus();
      }
    } else if (document.activeElement === lastFocusableElement) {
      evt.preventDefault();
      this._closeButton.focus();
    }
  };

  async _openKeyboardSelectDialog () {
    this._element.classList.add('pause-dialog_hidden');

    document.removeEventListener('keydown', this._keydownHandler);

    await this._keyboardSelectDialog.open();

    this._keyboardButton.textContent = this._keyboardSelectDialog.keyboardLayout;
    this._keyboardButton.focus();

    this._element.classList.remove('pause-dialog_hidden');

    document.addEventListener('keydown', this._keydownHandler);
  }
  
  _optionsClickHandler = (evt) => {
    if (!evt.target.classList.contains('pause-dialog__toggle')) return;

    this._manageAbilityToToggleHands();
    this._manageAbilityToSubmitOptions();
  };

  _optionsSubmitHandler = (evt) => {
    evt.preventDefault();

    this._submitOptions();
  };

  _overlayClickHandler = () => {
    this._close();
  };
  
  _closeButtonClickHandler = () => {
    this._close();
  };

  _keyboardButtonClickHandler = () => {
    this._openKeyboardSelectDialog();
  };

  _keydownHandler = (evt) => {
    if (evt.key === 'Tab') {
      this._manageFocus(evt);
    }

    if (evt.key === 'Escape') {
      evt.preventDefault();

      this._close();
    }
  };
}
