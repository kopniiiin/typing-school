const SERIES_MAX_LENGTH = 3;

class Statistics {
  constructor(problemKeyCodes) {
    this._problemKeyCodes = new Set(problemKeyCodes);

    this._seriesCounters = new Map();
    this._currentSeries = new Map();

    this._typoCounters = new Map();
  }

  addWrongKeyCode(keyCode) {
    let typoCounter = (this._typoCounters.has(keyCode)) ?
      this._typoCounters.get(keyCode) : 0;

    typoCounter++;

    this._typoCounters.set(keyCode, typoCounter);

    if (this._currentSeries.has(keyCode)) {
      this._currentSeries.set(keyCode, 0);
    }
  }

  addCorrectKeyCode(keyCode) {
    if (!this._problemKeyCodes.has(keyCode)) return;

    let currentSeries = (this._currentSeries.has(keyCode)) ?
      this._currentSeries.get(keyCode) : 0;

    currentSeries++;

    if (currentSeries < SERIES_MAX_LENGTH) {
      this._currentSeries.set(keyCode, currentSeries);
      return;
    }

    this._currentSeries.set(keyCode, 0);

    let seriesCounter = (this._seriesCounters.has(keyCode)) ?
      this._seriesCounters.get(keyCode) : 0;

    seriesCounter++;

    this._seriesCounters.set(keyCode, seriesCounter);
  }

  get keyCodesToTypoAmounts () {
    return this._typoCounters;
  }

  get keyCodesToCorrectSeriesAmounts () {
    return this._seriesCounters;
  }
}
