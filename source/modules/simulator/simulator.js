const ELEMENT_SELECTOR = '.simulator';
const METERS_SELECTOR = '.simulator__meters';
const CHAR_CONTAINER_SELECTOR = '.simulator__char-container';
const PAUSE_BUTTON_SELECTOR = '.simulator__pause-button';
const HIDDEN_METERS_CLASS = 'simulator__meters_hidden';
const SIMULATOR_WITHOUT_KEYBOARD_CLASS = 'simulator_no-keyboard';
const START_MESSAGE = 'Располагай руки на начальной позиции и жми пробел, чтобы начать';
const START_KEY = ' ';
const REQUIRED_CHARS = /^[а-яА-ЯёЁ0-9 .,:;!?()"_\-+=%№]$/;
const SHIFT_KEY = 'Shift';
const LEFT_SHIFT_CODE = 'ShiftLeft';
const BACKSPACE_KEY = 'Backspace';
const YO_CHAR = 'ё';
const E_CHAR = 'е';
const FOREIGN_CHARS = /^[a-zA-Z]$/;
const FOREIGN_KEYBOARD_MESSAGE = 'Выбери русскую раскладку';
const KEYBOARD_WITHOUT_YO_MESSAGE = 'Выбери раскладку с клавишей Ё';
const TIME_TO_SWITCH_BOXES = 440;
const CHAR_CONTAINER_SWITCH_CLASS = 'simulator__char-container_switch';

class Simulator {
  constructor (parameters) {
    this._element = document.querySelector(ELEMENT_SELECTOR);
    this._meters = this._element.querySelector(METERS_SELECTOR);
    this._charContainer = this._element.querySelector(CHAR_CONTAINER_SELECTOR);

    this._pauseButton = this._element.querySelector(PAUSE_BUTTON_SELECTOR);
    this._pauseButton.addEventListener('click', this._pauseButtonClickHandler);

    this._isTypoOccured = false;

    this._isForeignKeyboardSelected = false;
    this._isYoOnKeyboardWithoutYoTyped = false;

    this._isStarted = false;
    this._isPaused = false;
    this._pauseDuaration = 0;

    this._pressedKeys = new Set();

    this._accuracyMeter = new AccuracyMeter();
    this._speedometer = new Speedometer();

    this._textBox = new TextBox(parameters.textBoxTexts);
    this._charContainer.appendChild(this._textBox.element);

    this._hintLine = new HintLine();
    this._hintDialog = new HintDialog();

    this._keyboard = new Keyboard(parameters.keyboardType, parameters.areHandsOn);
    this._keyboardSelectDialog = new KeyboardSelectDialog(this._keyboard);

    if (!parameters.isKeyboardOn) {
      this.toggleKeyboard();
    }

    this._pauseDialog = new PauseDialog(
      this,
      this._keyboard,
      this._keyboardSelectDialog,
    );

    this._statistics = new Statistics(parameters.problemKeyCodes);

    this._setupKeyboard()
      .then(() => this._showHintDialogMessage(parameters.hintDialogMessage))
      .then(() => {
        this._hintLine.showHintMessage(START_MESSAGE);
        this._keyboard.showHowToType(START_KEY);
        return this._waitForUserStartKeyKeyup();
      })
      .then(() => {
        this._hintLine.hideMessage();
        this._start();
      });
  }

  toggleKeyboard () {
    this._element.classList.toggle(SIMULATOR_WITHOUT_KEYBOARD_CLASS);
  }

  get isKeyboardOn () {
    return !this._element.classList.contains(SIMULATOR_WITHOUT_KEYBOARD_CLASS);
  }

  async _setupKeyboard () {
    if (this._keyboard.type) return;

    return this._keyboardSelectDialog.open(true);
  }

  async _showHintDialogMessage (hintDialogMessage) {
    if (!hintDialogMessage) return;

    return this._hintDialog.showHintMessage(hintDialogMessage);
  }

  _start () {
    this._isStarted = true;
    this._startTime = Date.now();

    document.addEventListener('keydown', this._keydownHandler);
    window.addEventListener('keyup', this._keyupHandler);

    if (this._isTimeToTypeKeys) {
      this._startWithKeys();
    } else {
      this._startWithText();
    }
  }

  _waitForUserStartKeyKeyup () {
    return new Promise((resolve) => {
      const startKeyKeyupHandler = (evt) => {
        // Во время паузы нажатия стартовой клавиши не учитываются
        if (
          evt.key !== START_KEY ||
          this._isPaused
        ) return;

        document.removeEventListener('keyup', startKeyKeyupHandler);
        resolve();
      };

      document.addEventListener('keyup', startKeyKeyupHandler);
    });
  }

  _startWithKeys () {
    this._keyBox.showCursor();
    this._keyboard.showHowToType(this._keyBox.requiredChar);
  }

  _startWithText () {
    this._meters.classList.remove(HIDDEN_METERS_CLASS);
    this._textBox.showCursor();
    this._keyboard.showHowToType(this._textBox.requiredChar);
    this._speedometer.start();
  }

  _pause() {
    this._isPaused = true;

    document.removeEventListener('keydown', this._keydownHandler);

    // До старта урока после паузы ничего дополнительного делать не нужно
    if (!this._isStarted) {
      this._pauseDialog.open()
        .then(() => this._isPaused = false);

      return;
    }

    this._pauseTime = Date.now();

    if (!this._isTimeToTypeKeys) {
      this._speedometer.pause();
    }

    this._pauseDialog.open()
      .then(() => {
        this._isPaused = false;
        this._hintLine.showHintMessage(START_MESSAGE);
        return this._waitForUserStartKeyKeyup();
      }).then(() => {
        this._hintLine.hideMessage();
        this._continue();
      });
  }

  _continue () {
    this._pauseDuaration += Date.now() - this._pauseTime;

    document.addEventListener('keydown', this._keydownHandler);

    if (!this._isTimeToTypeKeys) {
      this._speedometer.continue();
    }
  }

  _pauseButtonClickHandler = () => {
    this._pause();
  };

  _keydownHandler = (evt) => {
    if (
      evt.ctrlKey || evt.altKey || evt.metaKey ||
      this._pressedKeys.has(evt.code)
    ) return;

    const key = evt.key;

    if (FOREIGN_CHARS.test(key)) {
      this._hintLine.showWarningMessage(FOREIGN_KEYBOARD_MESSAGE);
      this._isForeignKeyboardSelected = true;
      return;
    }

    if (this._isForeignKeyboardSelected) {
      this._hintLine.hideMessage();
      this._isForeignKeyboardSelected = false;
    }

    if (!this._keyboard.hasYo && key.toLowerCase() === YO_CHAR) {
      this._hintLine.showWarningMessage(KEYBOARD_WITHOUT_YO_MESSAGE);
      this._isYoOnKeyboardWithoutYoTyped = true;
      return;
    }

    if (this._isYoOnKeyboardWithoutYoTyped) {
      this._hintLine.hideMessage();
      this._isYoOnKeyboardWithoutYoTyped = false;
    }

    this._pressedKeys.add(evt.code);

    if (REQUIRED_CHARS.test(key)) {
      this._handleCharKeyKeydown(evt);
      return;
    }

    if (key === SHIFT_KEY) {
      this._handleShiftKeyKeydown(evt);
      return;
    }

    if (key === BACKSPACE_KEY) {
      this._handleBackspaceKeyKeydown();
    }
  };

  _handleCharKeyKeydown (evt) {
    const typedChar = evt.key;

    this._keyboard.pressCharKey(typedChar);

    if (this._isTypoOccured) return;

    if (this._isTimeToTypeKeys) {
      this._handleKeyTyping(typedChar);
    } else {
      this._handleTextTyping(evt);
    }
  }

  _handleShiftKeyKeydown(evt) {
    this._keyboard.pressShiftKey(evt.code === LEFT_SHIFT_CODE);
  }

  _handleBackspaceKeyKeydown() {
    this._keyboard.pressBackspaceKey();

    if (!this._isTypoOccured) return;

    if (this._isTimeToTypeKeys) {
      this._handleKeyErasing();
    } else {
      this._handleTextErasing();
    }
  }

  _handleKeyTyping(typedChar) {
    typedChar = this._transformTypedCharIfNeeded(typedChar, this._keyBox.requiredChar);

    if (!this._keyBox.type(typedChar)) {
      this._isTypoOccured = true;
      this._keyboard.showHowToErase();
      return;
    }

    if (this._keyBox.isFull) {
      this._switchBoxes();
      return;
    }

    this._keyboard.showHowToType(this._keyBox.requiredChar);
  }

  _handleTextTyping(evt) {
    const typedChar = this._transformTypedCharIfNeeded(evt.key, this._textBox.requiredChar);

    if (!this._textBox.type(typedChar)) {
      this._isTypoOccured = true;
      this._accuracyMeter.addTypo();
      this._keyboard.showHowToErase();
      this._statistics.addWrongKeyCode(evt.code);
      return;
    }

    this._statistics.addCorrectKeyCode(evt.code);
    this._accuracyMeter.addCorrectChar();
    this._speedometer.addChar();

    if (this._textBox.isFull) {
      this._finish();
      return;
    }

    if (this._textBox.isTimeToScroll) {
      this._textBox.scroll();
    }

    this._keyboard.showHowToType(this._textBox.requiredChar);
  }

  _transformTypedCharIfNeeded (typedChar, requiredChar) {
    if (
      this._keyboard.hasYo || 
      typedChar.toLowerCase() !== E_CHAR ||
      requiredChar.toLowerCase() !== YO_CHAR
    ) return typedChar;

    if (typedChar === E_CHAR) return YO_CHAR;
    if (typedChar === E_CHAR.toUpperCase()) return YO_CHAR.toUpperCase();
  }

  _handleKeyErasing() {
    this._isTypoOccured = false;

    this._keyBox.erase();

    this._keyboard.showHowToType(this._keyBox.requiredChar);
  }

  _handleTextErasing() {
    this._isTypoOccured = false;

    this._textBox.erase();

    this._keyboard.showHowToType(this._textBox.requiredChar);
  }

  _keyupHandler = (evt) => {
    if (evt.ctrlKey || evt.altKey || evt.metaKey) return;

    const { key, code } = evt;

    if (!this._pressedKeys.has(code)) return;

    this._pressedKeys.delete(code);

    if (REQUIRED_CHARS.test(key)) {
      this._keyboard.releaseCharKey(key);
      return;
    }

    if (key === SHIFT_KEY) {
      this._keyboard.releaseShiftKey(code === LEFT_SHIFT_CODE);
      return;
    }

    if (key === BACKSPACE_KEY) {
      this._keyboard.releaseBackspaceKey();
    }
  };

  _switchBoxes() {
    document.removeEventListener('keydown', this._keydownHandler);

    this._isTimeToTypeKeys = false;

    this._keyboard.takeInitialPosition();

    this._charContainer.classList.add(CHAR_CONTAINER_SWITCH_CLASS);

    setTimeout(() => {
      this._charContainer.replaceChild(this._textBox.element, this._keyBox.element);
      this._charContainer.classList.remove(CHAR_CONTAINER_SWITCH_CLASS);

      this._startWithText();

      document.addEventListener('keydown', this._keydownHandler);
    }, TIME_TO_SWITCH_BOXES);
  }

  _finish () {
    document.removeEventListener('keydown', this._keydownHandler);

    this._keyboard.takeInitialPosition();
    this._speedometer.finish();

    const keyCodesToTypoAmounts = {};
    this._statistics.keyCodesToTypoAmounts.forEach((typoAmount, keyCode) => {
      keyCodesToTypoAmounts[keyCode] = typoAmount;
    });

    const keyCodesToCorrectSeriesAmounts = {};
    this._statistics.keyCodesToCorrectSeriesAmounts.forEach((correctSeriesAmount, keyCode) => {
      keyCodesToCorrectSeriesAmounts[keyCode] = correctSeriesAmount;
    });

    const lessonResults = {
      lessonDuration: Date.now() - this._startTime - this._pauseDuaration,
      lessonLength: this._keyBox ?
          this._keyBox.length + this._textBox.length : this._textBox.length,
      averageSpeed: this._speedometer.averageSpeed,
      keyCodesToTypoAmounts: keyCodesToTypoAmounts,
      keyCodesToCorrectSeriesAmounts: keyCodesToCorrectSeriesAmounts
    };
  }
}
