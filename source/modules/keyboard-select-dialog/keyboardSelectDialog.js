const OS_OPTION = 'os';
const OS_WINDOWS = 'windows';
const OS_MACOS = 'macos';

const ENTER_OPTION = 'enter';
const ENTER_ANSI = 'ansi';
const ENTER_ISO = 'iso';

const LAYOUT_OPTION = 'layout';
const LAYOUT_RUS = 'rus';
const LAYOUT_RUS_PC = 'rus-pc';

const LAYOUTS_NAMES_TRANSLATIONS = new Map ([
  [LAYOUT_RUS, 'Русская'],
  [LAYOUT_RUS_PC, 'Русская-ПК']
]);

const KEYBOARD_TYPE_WINDOWS_ANSI_RUS_PC = 'keyboard-windows-ansi-rus-pc';
const KEYBOARD_TYPE_WINDOWS_ISO_RUS_PC = 'keyboard-windows-iso-rus-pc';
const KEYBOARD_TYPE_MACOS_ANSI_RUS = 'keyboard-macos-ansi-rus';
const KEYBOARD_TYPE_MACOS_ANSI_RUS_PC = 'keyboard-macos-ansi-rus-pc';
const KEYBOARD_TYPE_MACOS_ISO_RUS = 'keyboard-macos-iso-rus';
const KEYBOARD_TYPE_MACOS_ISO_RUS_PC = 'keyboard-macos-iso-rus-pc';

const KEYBOARD_TYPES_TO_OPTION_VARIANTS = new Map ([
  [KEYBOARD_TYPE_WINDOWS_ANSI_RUS_PC, {
    os: OS_WINDOWS,
    enter: ENTER_ANSI
  }],
  [KEYBOARD_TYPE_WINDOWS_ISO_RUS_PC, {
    os: OS_WINDOWS,
    enter: ENTER_ISO
  }],
  [KEYBOARD_TYPE_MACOS_ANSI_RUS, {
    os: OS_MACOS,
    enter: ENTER_ANSI,
    layout: LAYOUT_RUS
  }],
  [KEYBOARD_TYPE_MACOS_ANSI_RUS_PC, {
    os: OS_MACOS,
    enter: ENTER_ANSI,
    layout: LAYOUT_RUS_PC
  }],
  [KEYBOARD_TYPE_MACOS_ISO_RUS, {
    os: OS_MACOS,
    enter: ENTER_ISO,
    layout: LAYOUT_RUS
  }],
  [KEYBOARD_TYPE_MACOS_ISO_RUS_PC, {
    os: OS_MACOS,
    enter: ENTER_ISO,
    layout: LAYOUT_RUS_PC
  }],
]);

class KeyboardSelectDialog {
  constructor (keyboard) {
    this._element = document.querySelector('.keyboard-select-dialog');
    this._overlay = this._element.querySelector('.keyboard-select-dialog__overlay');
    this._options = this._element.querySelector('.keyboard-select-dialog__options');
    this._layoutOption = this._options.querySelector('.keyboard-select-dialog__option_layout');

    this._closeButton = this._element.querySelector('.keyboard-select-dialog__close-button');
    this._submitButton = this._options.querySelector('.keyboard-select-dialog__submit-button');

    this._overlay.addEventListener('click', this._overlayClickHandler);
    this._closeButton.addEventListener('click', this._closeButtonClickHandler);
    this._options.addEventListener('change', this._optionChangeHandler);
    this._options.addEventListener('submit', this._optionSubmitHandler);

    this._keyboard = keyboard;

    // Если тип клавиатуры не определен, то начальные настройки
    // соответствуют самому популярному варианту
    this._initialKeyboardType = this._keyboard.type ?
        this._keyboard.type : KEYBOARD_TYPE_WINDOWS_ANSI_RUS_PC;

    this._isRequired = false;

    this._setInitialOptionVariants();
  }

  open (isRequired) {
    this._isRequired = Boolean(isRequired);

    this._prepareDialogForOpening();

    return new Promise((resolve => {
      this._closeDialogPromiseResolver = resolve;
    }));
  }

  get keyboardLayout () {
    if (this._options[OS_OPTION] === OS_WINDOWS) {
      return LAYOUTS_NAMES_TRANSLATIONS[LAYOUT_RUS_PC];
    }

    return LAYOUTS_NAMES_TRANSLATIONS.get(
      this._options[LAYOUT_OPTION].value
    );
  }

  _prepareDialogForOpening () {
    this._element.classList.remove('keyboard-select-dialog_hidden');

    document.addEventListener('keydown', this._keydownHandler);

    if (this._isRequired) {
      this._closeButton.classList.add('keyboard-select-dialog__close-button_hidden');
      this._submitButton.disabled = false;
    } else {
      this._closeButton.classList.remove('keyboard-select-dialog__close-button_hidden');
    }

    this._getFirstFocusableElement().focus();
  }

  _close () {
    if (this._isRequired) return;

    this._prepareDialogForClosing();

    this._closeDialogPromiseResolver();
  };

  _prepareDialogForClosing () {
    this._element.classList.add('keyboard-select-dialog_hidden');

    document.removeEventListener('keydown', this._keydownHandler);

    this._setInitialOptionVariants();
  }

  _setInitialOptionVariants () {
    const initialOptionVariants = KEYBOARD_TYPES_TO_OPTION_VARIANTS.get(this._initialKeyboardType);

    this._options[OS_OPTION].value = initialOptionVariants.os;
    this._options[ENTER_OPTION].value = initialOptionVariants.enter;
    this._options[LAYOUT_OPTION].value = initialOptionVariants.layout ?
        initialOptionVariants.layout : LAYOUT_RUS;

    this._manageNeedToSelectLayout();
    this._manageAbilityToSubmitOptions();
  }

  _calculateCurrentKeyboardType () {
    const osOptionVariant = this._options[OS_OPTION].value;
    const enterOptionVariant = this._options[ENTER_OPTION].value;
    const layoutOptionVariant = this._options[LAYOUT_OPTION].value;

    if (osOptionVariant === OS_WINDOWS) {
      return enterOptionVariant === ENTER_ANSI ?
          KEYBOARD_TYPE_WINDOWS_ANSI_RUS_PC :
          KEYBOARD_TYPE_WINDOWS_ISO_RUS_PC;
    }

    if (enterOptionVariant === ENTER_ANSI) {
      return layoutOptionVariant === LAYOUT_RUS ?
          KEYBOARD_TYPE_MACOS_ANSI_RUS :
          KEYBOARD_TYPE_MACOS_ANSI_RUS_PC;
    } else {
      return layoutOptionVariant === LAYOUT_RUS ?
          KEYBOARD_TYPE_MACOS_ISO_RUS :
          KEYBOARD_TYPE_MACOS_ISO_RUS_PC;
    }
  }

  _submitOptions () {
    this._initialKeyboardType = this._calculateCurrentKeyboardType();
    this._keyboard.changeType(this._initialKeyboardType);

    this._submitButton.disabled = true;

    if (!this._isRequired) return;

    // Обязательная форма закрывается только при сабмите
    this._isRequired = false;
    this._close();
  }

  _manageAbilityToSubmitOptions () {
    if (this._isRequired) return;

    this._submitButton.disabled = this._initialKeyboardType === this._calculateCurrentKeyboardType();
  }

  _manageNeedToSelectLayout () {
    if (this._options[OS_OPTION].value === OS_MACOS) {
      this._layoutOption.classList.remove('keyboard-select-dialog__option_hidden');
    } else {
      this._layoutOption.classList.add('keyboard-select-dialog__option_hidden');
    }
  }

  _manageFocus (evt) {
    const firstFocusableElement = this._getFirstFocusableElement();
    const lastFocusableElement = this._getLastFocusableElement();

    if (evt.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        evt.preventDefault();
        lastFocusableElement.focus();
      }
    } else if (document.activeElement === lastFocusableElement) {
      evt.preventDefault();
      firstFocusableElement.focus();
    }
  }
  
  _getFirstFocusableElement () {
    return this._closeButton.classList.contains('keyboard-select-dialog__close-button_hidden') ?
      this._options.querySelector('.keyboard-select-dialog__option_os :checked') :
      this._closeButton;
  }

  _getLastFocusableElement () {
    if (!this._submitButton.disabled) {
      return this._submitButton;
    }

    return this._layoutOption.classList.contains('keyboard-select-dialog__option_hidden') ?
        this._options.querySelector('.keyboard-select-dialog__option_enter :checked') :
        this._options.querySelector('.keyboard-select-dialog__option_layout :checked');
  }

  _optionChangeHandler = () => {
    this._manageNeedToSelectLayout();
    this._manageAbilityToSubmitOptions();
  };

  _optionSubmitHandler = (evt) => {
    evt.preventDefault();

    this._submitOptions();
  };

  _overlayClickHandler = () => {
    this._close();
  };

  _closeButtonClickHandler = () => {
    this._close();
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
