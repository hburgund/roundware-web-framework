"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.User = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var deviceId, clientType, userName, apiClient;
var authToken = "UNKNOWN";
var userName = "(anonymous)";

/** Responsible for identifying the user to the Roundware server and retrieving an auth token **/

var User = exports.User = function () {
  /** Create a User
   * @param {Object} options - Various configuration parameters for this user
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
   * @param {String} options.deviceId - this value distinguishes a particular user, who may be anonymous, to the server; by default we will fingerprint the browser to get this value, but you can supply your own value (useful if your app has a preexisting authorization scheme)
   * @param {String} [options.clientType = "web"] 
   **/
  function User(options) {
    _classCallCheck(this, User);

    apiClient = options.apiClient;

    // TODO need to try to persist deviceId as a random value that can partially serve as "a unique identifier generated by the client" that can 
    // used to claim a anonymous user's contributions. Some ideas for implementation: https://clientjs.org/ and https://github.com/Valve/fingerprintjs2
    deviceId = options.deviceId || "00000000000000";
    clientType = options.clientType || "web";
  }

  /** @returns {String} human-readable representation of this user **/


  _createClass(User, [{
    key: "toString",
    value: function toString() {
      return "User " + userName + " (deviceId " + deviceId + ")";
    }

    /** Make an API call to associate the (possibly anonymous) application user with a Roundware user account.
     * Upon success, this function receives an auth token, which is passed onto the apiClient object.
     * @returns {Promise} represents the pending API call **/

  }, {
    key: "connect",
    value: function connect() {
      var data = {
        device_id: deviceId,
        client_type: clientType
      };

      // TODO need to also handle auth failures
      return apiClient.post("/users/", data).done(function connectionSuccess(data) {
        userName = data.username;
        apiClient.setAuthToken(data.token);
      });
    }
  }]);

  return User;
}();