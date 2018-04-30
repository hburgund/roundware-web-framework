import { logger } from "./shims";

const initialGeoTimeoutSeconds = 10;

const defaultCoords = {
  latitude: 1,
  longitude: 1
};

// for an initial rapid, low-accuracy position
const fastGeolocationPositionOptions = {
  enableHighAccuracy: false,
  timeout: initialGeoTimeoutSeconds
};

// subsequent position monitoring should be high-accuracy
const accurateGeolocationPositionOptions = {
  enableHighAccuracy: true
};

/** Responsible for tracking the user's position, when geo listening is enabled and the browser is capable
 * @property {Boolean} geoListenEnabled - whether or not the geo positioning system is enabled and available
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation **/
export class GeoPosition {
  /** Create a new GeoPosition.
   * @param {Object} navigator - provides access to geolocation system
   * @param {Object} options - parameters for initializing this GeoPosition
   * @param {Boolean} [options.geoListenEnabled = false] - whether or not to attempt to use geolocation **/
  constructor(navigator,options = {}) {
    this._navigator = navigator;
    // maybe not important anymore?
    this._initialGeolocationPromise = Promise.resolve(defaultCoords);
    this._lastCoords = defaultCoords;
    console.log('geo requirements = ' + this._navigator.geolocation + " - " + options.geoListenEnabled);
    console.log(this._navigator.geolocation);

    if (this._navigator.geolocation && options.geoListenEnabled) {
      this.geoListenEnabled = true;
    } else {
      this.geoListenEnabled = true;
    }
  }

  /** @return {String} Human-readable representation of this GeoPosition **/
  toString() {
    return `GeoPosition (enabled: ${this.geoListenEnabled})`;
  }

  /** @return {Object} coordinates - last known coordinates received from the geolocation system (defaults to latitude 1, longitude 1) **/
  getLastCoords() {
    return this._lastCoords;
  }

  /** Attempts to get an initial rough geographic location for the listener, then sets up a callback
   * to update the position.
   * @param {Function} geoUpdateCallback - object that should receive geolocation coordinate updates
   * @see geoListenEnabled **/
   // whatever function gets passed in gets called when new position happens
  connect(geoUpdateCallback = () => {}) {
    if (!this.geoListenEnabled) {
      console.log("Geolocation disabled");
      this._initialGeolocationPromise = Promise.resolve({});
      return;
    }

    console.log("Initializing geolocation system");

    this._initialGeolocationPromise = new Promise((resolve,reject) => {
      this._navigator.geolocation.getCurrentPosition((initialPosition) => {
        let coords = initialPosition.coords;
        console.log("Received initial geolocation",coords);
        geoUpdateCallback(coords);
        this._lastCoords = coords;

        let geoWatchId = this._navigator.geolocation.watchPosition((updatedPosition) => {
          let newCoords = updatedPosition.coords;
          console.log("Received updated geolocation",newCoords);
          geoUpdateCallback(newCoords);
          this._lastCoords = coords;
        },(error) => {
          console.log(`Unable to watch position: ${error.message} (code #${error.code})`);
        },accurateGeolocationPositionOptions);

        console.log(`Monitoring geoposition updates (watch ID ${geoWatchId})`);
        resolve(coords);
      },function initialGeoError(error) {
        console.log(`Unable to get initial geolocation: ${error.message} (code #${error.code})`);
        resolve(defaultCoords);
      },fastGeolocationPositionOptions);
    });
  }

  /** Allows you to wait on the progress of the .connect() behavior, attempting to get an initial
   * estimate of the user's position. Note that this promise will never fail - if we cannot get an
   * accurate estimate, we fall back to default coordinates (currently latitude 1, longitude 1)
   * @return {Promise} Represents the attempt to get an initial estimate of the user's position **/
  waitForInitialGeolocation() {
    return this._initialGeolocationPromise;
  }
}
