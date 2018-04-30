import { logger } from "./shims";

var projectId, apiClient;
var projectName = "(unknown)";
var pubDate, audioFormat, recordingRadius, location, geoListenEnabled;

export class Project {
  constructor(newProjectId,options) {
    projectId = newProjectId;
    apiClient = options.apiClient;
  }

  toString() {
    return `Roundware Project '${projectName}' (#${projectId})`;
  }

  connect(sessionId) {
    var path = "/projects/" + projectId + "/";

    var data = {
      session_id: sessionId
    };

    let that = this;

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        projectName = data.name;
        pubDate = data.pub_date;
        audioFormat = data.audio_format;
        that.recordingRadius = data.recording_radius;
        that.location = {"latitude": data.latitude,
                         "longitude": data.longitude};
        that.maxRecordingLength = data.max_recording_length;
        that.legalAgreement = data.legal_agreement;
        that.outOfRangeMessage = data.out_of_range_message;
        that.geoListenEnabled = data.geo_listen_enabled;
        console.log(`geolisten = ${that.geoListenEnabled}`);
        // console.log(`recordingRadius = ${recordingRadius}`);
        return sessionId;
      });
  }

  uiconfig(sessionId) {
    var path = "/projects/" + projectId + "/uiconfig/";

    var data = {
      session_id: sessionId
    };

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        // let this._uiConfig = data;
        return data;
      });
  }
}
