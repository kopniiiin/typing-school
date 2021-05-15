const TIME_BETWEEN_CALCULATIONS = 1000;
const SECONDS_PER_PERIOD_LIMIT = 10;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_MINUTE = 60000;

class Speedometer {
  constructor() {
    this._element = document.querySelector('.speedometer');
    this._indicator = this._element.querySelector('.speedometer__indicator');

    this._charCounters = [];
    this._currentCharCounter = 0;
    this._currentSpeed = 0;

    // Для правильного продолжения работы после паузы состояние сохраняется
    // после каждого нажатия и в начале работы
    this._saveCurrentState();

    this._totalCharCounter = 0;

    this._pauseDuration = 0;
  }

  start() {
    this._startTime = Date.now();
    
    this._calculationInterval = setInterval(
      this._speedCalculator, 
      TIME_BETWEEN_CALCULATIONS
    );
  }

  pause() {
    clearInterval(this._calculationInterval);
    
    this._pauseTime = Date.now();
  }

  continue() {
    this._restoreCurrentState();

    this._pauseDuration += Date.now() - this._pauseTime;
    
    this._calculationInterval = setInterval(
      this._speedCalculator, 
      TIME_BETWEEN_CALCULATIONS
    );
  }

  finish() {
    clearInterval(this._calculationInterval);
    
    this._calculateAverageSpeed();
  }

  addChar() {
    this._totalCharCounter++;
    this._currentCharCounter++;

    this._saveCurrentState();
  }

  get averageSpeed () {
    return this._averageSpeed;
  }

  _speedCalculator = () => {
    this._charCounters.push(this._currentCharCounter);
    this._currentCharCounter = 0;

    const charsPerPeriod = this._charCounters.reduce((charsPerPeriod, charsPerSecond) =>
      charsPerPeriod + charsPerSecond
    );

    const secondsPerPeriod = this._charCounters.length;

    // Скорость измеряется в сим/мин
    this._currentSpeed = Math.round(
      charsPerPeriod * (SECONDS_PER_MINUTE / secondsPerPeriod)
    );

    this._updateIndicator();

    if (secondsPerPeriod === SECONDS_PER_PERIOD_LIMIT) {
      this._charCounters.shift();
    }
  };

  _calculateAverageSpeed() {
    const totalTimeInMilliseconds = Date.now() - this._startTime - this._pauseDuration;
    const totalTimeInMinutes = totalTimeInMilliseconds / MILLISECONDS_PER_MINUTE;

    // Скорость измеряется в сим/мин
    this._averageSpeed = Math.round(
      this._totalCharCounter / totalTimeInMinutes
    );
  }

  _updateIndicator() {
    this._indicator.textContent = this._currentSpeed;
  }

  _saveCurrentState() {
    this._lastCharCounters = this._charCounters.slice();
    this._lastCharCounter = this._currentCharCounter;
    this._lastSpeed = this._currentSpeed;
  }

  _restoreCurrentState() {
    this._charCounters = this._lastCharCounters.slice();
    this._currentCharCounter = this._lastCharCounter;
    this._currentSpeed = this._lastSpeed;

    this._updateIndicator();
  }
}
