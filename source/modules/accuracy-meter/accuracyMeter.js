class AccuracyMeter {
  constructor() {
    this._element = document.querySelector('.accuracy-meter');
    this._indicator = this._element.querySelector('.accuracy-meter__indicator');

    this._totalCharCounter = 0;
    this._correctCharCounter = 0;
  }

  addCorrectChar() {
    this._totalCharCounter++;
    this._correctCharCounter++;
    this._calculateAccuracy();
    this._updateIndicator();
  }

  addTypo() {
    this._totalCharCounter++;
    this._calculateAccuracy();
    this._updateIndicator();
  }

  get accuracy() {
    return this._accuracy;
  }

  _calculateAccuracy() {
    this._accuracy = Math.round((this._correctCharCounter / this._totalCharCounter) * 100);
  }

  _updateIndicator() {
    this._indicator.textContent = this._accuracy + '%';
  }
}
