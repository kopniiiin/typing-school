'use strict';

//=require ../modules/simulator/simulator.js
//=require ../modules/speedometer/speedometer.js
//=require ../modules/accuracy-meter/accuracyMeter.js
//=require ../modules/text-char/textChar.js
//=require ../modules/text-line/textLine.js
//=require ../modules/text-box/textBox.js
//=require ../modules/hint-line/hintLine.js
//=require ../modules/keyboard/keyboard.js
//=require ../modules/hint-dialog/hintDialog.js
//=require ../modules/pause-dialog/pauseDialog.js
//=require ../modules/keyboard-select-dialog/keyboardSelectDialog.js
//=require ../modules/button/button.js
//=require ../modules/toggle/toggle.js
//=require ../modules/statistics/statistics.js

const simulator = new Simulator({
  hintDialogMessage: 'Добро пожаловать в тренажер слепой печати!',
  textBoxTexts: [
    'Добро пожаловать в тренажер слепой печати!',
    'Тренируйся каждый день по 15 минут',
    'И совсем скоро ты будешь печатать, обгоняя мысли'
  ],
  keyboardType: '',
  areHandsOn: true,
  isKeyboardOn: true,
  problemKeyCodes: []
});
