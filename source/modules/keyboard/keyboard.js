const DEFAULT_KEYBOARD_TYPE = 'keyboard-windows-ansi-rus-pc';

const KEYBOARD_TYPE_WITHOUT_YO = 'keyboard-macos-ansi-rus-pc';

const HAND_INITIAL_POSITION = 1;

const LEFT_HAND_POSITIONS_TO_OFFSETS = [
  {x: 0, y: 0},
  {x: -15, y: -22},
  {x: -18, y: -22},
  {x: -18, y: -21},
  {x: -20, y: -21},
  {x: -21, y: -23},
  {x: -21, y: -21},
  {x: -21, y: -20},
  {x: -1, y: -9},
  {x: -1, y: -11},
  {x: -1, y: -12},
  {x: -3, y: -11},
  {x: 0, y: -10},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: -8, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: -2, y: -2},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0}
];

const RIGHT_HAND_POSITIONS_TO_OFFSETS = [
  {x: 0, y: 0},
  {x: 4, y: -22},
  {x: 1, y: -21},
  {x: 2, y: -23},
  {x: 2, y: -22},
  {x: 2, y: -24},
  {x: 3, y: -25},
  {x: 4, y: -20},
  {x: 4, y: -8},
  {x: 1, y: -9},
  {x: 0, y: -10},
  {x: 0, y: -9},
  {x: 0, y: -10},
  {x: 1, y: -12},
  {x: 0, y: -11},
  {x: -4, y: -9},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 1, y: 0},
  {x: 0, y: 0},
  {x: 1, y: -5},
  {x: 0, y: 0},
  {x: 0, y: 0},
  {x: 0, y: 1},
  {x: 0, y: 0},
];

class Keyboard {
  constructor (keyboardType, areHandsOn) {
    this._element = document.querySelector('.keyboard');
    this._keys = this._element.querySelector('.keyboard__keys');
    this._leftHand = this._element.querySelector('.keyboard__hand_left');
    this._rightHand = this._element.querySelector('.keyboard__hand_right');

    this._isHandToPressSpaceKeyLeft = true;
    this._isTimeToPressBackspace = false;

    this._keyboardType = keyboardType;

    if (!this._keyboardType) return;

    if (this._keyboardType !== DEFAULT_KEYBOARD_TYPE) {
      this._replaceKeys();
    }

    this._rememberHowToPressKeys();

    if (!areHandsOn) {
      this.toggleHands();
    }
  }

  showHowToType (requiredChar) {
    this._hideCurrentRequiredKeys();

    this._requiredChar = requiredChar;

    requiredChar = this._transformCharIfNeeded(requiredChar);

    const requiredCharKeyPressingInfo = this._charsToPressingInfo.get(requiredChar);
    
    this._showRequiredKeys(
      requiredCharKeyPressingInfo.charKey, 
      requiredCharKeyPressingInfo.shiftKey
    );

    let leftHandPosition = requiredCharKeyPressingInfo.leftHandPosition;
    let rightHandPosition = requiredCharKeyPressingInfo.rightHandPosition;

    // После нажатия любой символьной клашивши (отличной от пробела) пробел нажимается рукой,
    // которая была в начальном положении или нажимала shift.
    // Пробелы подряд нажимаются одной рукой.
    if (this._requiredChar === ' ') {
      leftHandPosition = this._isHandToPressSpaceKeyLeft ? leftHandPosition : HAND_INITIAL_POSITION;
      rightHandPosition = this._isHandToPressSpaceKeyLeft ? HAND_INITIAL_POSITION : rightHandPosition;
    } else {
      this._isHandToPressSpaceKeyLeft =
        leftHandPosition === HAND_INITIAL_POSITION ||
        leftHandPosition === this._leftShiftKeyPressingInfo.leftHandPosition;
    }

    this._showHandPosition(leftHandPosition, rightHandPosition);
  }

  showHowToErase () {
    this._hideCurrentRequiredKeys();

    this._isTimeToPressBackspace = true;

    this._showRequiredKeys(this._backspaceKeyPressingInfo.backspaceKey);

    this._showHandPosition(this._backspaceKeyPressingInfo.leftHandPosition, this._backspaceKeyPressingInfo.rightHandPosition);
  }

  takeInitialPosition () {
    this._hideCurrentRequiredKeys();
    this._showHandPosition(HAND_INITIAL_POSITION, HAND_INITIAL_POSITION);
  }

  pressCharKey (typedChar) {
    this._showPressedKey(this._charsToPressingInfo.get(typedChar).charKey);
  }

  releaseCharKey (typedChar) {
    this._hideReleasedKey(this._charsToPressingInfo.get(typedChar).charKey);
  }

  pressShiftKey (isLeft) {
    const pressedShiftKey = isLeft ?
      this._leftShiftKeyPressingInfo.shiftKey :
      this._rightShiftKeyPressingInfo.shiftKey;

    this._showPressedKey(pressedShiftKey);
  }

  releaseShiftKey (isLeft) {
    const releasedShiftKey = isLeft ?
      this._leftShiftKeyPressingInfo.shiftKey :
      this._rightShiftKeyPressingInfo.shiftKey;

    this._hideReleasedKey(releasedShiftKey);
  }

  pressBackspaceKey () {
    this._showPressedKey(this._backspaceKeyPressingInfo.backspaceKey);
  }

  releaseBackspaceKey () {
    this._hideReleasedKey(this._backspaceKeyPressingInfo.backspaceKey);
  }

  toggleHands () {
    this._element.classList.toggle('keyboard_no-hands');
  }

  changeType (keyboardType) {
    this._keyboardType = keyboardType;

    this._isHandToPressSpaceKeyLeft = true;

    this._replaceKeys();
    this._rememberHowToPressKeys();

    if (this._requiredChar) {
      this.showHowToType(this._requiredChar);
    } else if (this._isTimeToPressBackspace) {
      this.showHowToErase();
    }
  }

  get type () {
    return this._keyboardType;
  }

  get areHandsOn () {
    return !this._element.classList.contains('keyboard_no-hands');
  }

  get hasYo () {
    return this._keyboardType !== KEYBOARD_TYPE_WITHOUT_YO;
  }

  _showPressedKey (pressedKey) {
    const pressedKeyClass = (pressedKey.classList.contains('keyboard__key_required')) ?
      'keyboard__key_correct' :
      'keyboard__key_wrong';

    pressedKey.classList.add(pressedKeyClass);
  }

  _hideReleasedKey (releasedKey) {
    releasedKey.classList.remove('keyboard__key_correct', 'keyboard__key_wrong');
  }

  _showRequiredKeys (firstRequiredKey, secondRequiredKey) {
    firstRequiredKey.classList.add('keyboard__key_required');

    if (!secondRequiredKey) return;

    secondRequiredKey.classList.add('keyboard__key_required');
  }

  _showHandPosition (leftHandPosition, rightHandPosition) {
    const leftHandOffsetX = LEFT_HAND_POSITIONS_TO_OFFSETS[leftHandPosition - 1].x;
    const leftHandOffsetY = LEFT_HAND_POSITIONS_TO_OFFSETS[leftHandPosition - 1].y;
    this._leftHand.innerHTML = `<use xlink:href='#hand-left-${leftHandPosition}'></use>`;
    this._leftHand.style.transform = `translate(${leftHandOffsetX}%, ${leftHandOffsetY}%)`;

    const rightHandOffsetX = RIGHT_HAND_POSITIONS_TO_OFFSETS[rightHandPosition - 1].x;
    const rightHandOffsetY = RIGHT_HAND_POSITIONS_TO_OFFSETS[rightHandPosition - 1].y;
    this._rightHand.innerHTML = `<use xlink:href='#hand-right-${rightHandPosition}'></use>`;
    this._rightHand.style.transform = `translate(${rightHandOffsetX}%, ${rightHandOffsetY}%)`;
  }

  _hideCurrentRequiredKeys () {
    this._leftShiftKeyPressingInfo.shiftKey.classList.remove('keyboard__key_required');
    this._rightShiftKeyPressingInfo.shiftKey.classList.remove('keyboard__key_required');

    this._isTimeToPressBackspace = false;
    this._backspaceKeyPressingInfo.backspaceKey.classList.remove('keyboard__key_required');

    if (!this._requiredChar) return;

    const charToFindRequiredCharKey = this._transformCharIfNeeded(this._requiredChar);

    this._charsToPressingInfo.get(charToFindRequiredCharKey).charKey
      .classList.remove('keyboard__key_required');

    this._requiredChar = null;
  }

  _transformCharIfNeeded (char) {
    if (
      this.hasYo ||
      char.toLowerCase() !== 'ё'
    ) return char;

    if (char === 'ё') return 'е';
    if (char === 'ё'.toUpperCase()) return 'е'.toUpperCase();
  }

  _replaceKeys () {
    const newReplaceableKeys = Keyboard.template.getElementById(this._keyboardType).cloneNode(true);
    const oldReplaceableKeys = this._keys.querySelector('.keyboard__replaceable-keys');

    this._keys.replaceChild(newReplaceableKeys, oldReplaceableKeys);
  }

  _rememberHowToPressKeys () {
    this._rememberHowToPressShiftKeys();
    
    this._rememberHowToPressBackspaceKey();

    this._charsToPressingInfo = new Map();

    this._element.querySelectorAll('[data-char]').forEach((charKey) => {
      this._rememberHowToPressCharKey(charKey);
    });
  }

  _rememberHowToPressShiftKeys () {
    const leftShiftKey = this._element.querySelector('[data-shift="left"]');
    const rightShiftKey = this._element.querySelector('[data-shift="right"]');

    this._leftShiftKeyPressingInfo = {
      shiftKey: leftShiftKey,
      leftHandPosition: parseInt(leftShiftKey.dataset.leftHandPosition)
    };

    this._rightShiftKeyPressingInfo = {
      shiftKey: rightShiftKey,
      rightHandPosition: parseInt(rightShiftKey.dataset.rightHandPosition)
    };
  }

  _rememberHowToPressBackspaceKey () {
    const backspaceKey = this._element.querySelector('[data-backspace]');

    // клавиша backspace всегда нажимается правой рукой
    this._backspaceKeyPressingInfo = {
      backspaceKey: backspaceKey,
      leftHandPosition: HAND_INITIAL_POSITION,
      rightHandPosition: parseInt(backspaceKey.dataset.rightHandPosition)
    }
  };

  _rememberHowToPressCharKey (charKey) {
    const char = charKey.dataset.char;
    const shiftChar = charKey.dataset.shiftChar;
    const leftHandPosition = parseInt(charKey.dataset.leftHandPosition) || HAND_INITIAL_POSITION;
    const rightHandPosition = parseInt(charKey.dataset.rightHandPosition) || HAND_INITIAL_POSITION;

    this._charsToPressingInfo.set(char, {
      charKey: charKey,
      leftHandPosition: leftHandPosition,
      rightHandPosition: rightHandPosition
    });

    if (!shiftChar) return;

    const isLeftShiftRequired = leftHandPosition === HAND_INITIAL_POSITION;

    this._charsToPressingInfo.set(shiftChar, {
      charKey: charKey,
      shiftKey: isLeftShiftRequired ? this._leftShiftKeyPressingInfo.shiftKey : this._rightShiftKeyPressingInfo.shiftKey,
      leftHandPosition: isLeftShiftRequired ? this._leftShiftKeyPressingInfo.leftHandPosition : leftHandPosition,
      rightHandPosition: isLeftShiftRequired ? rightHandPosition : this._rightShiftKeyPressingInfo.rightHandPosition
    });
  }
}

Keyboard.template = document.querySelector('#template-keyboard').content;
