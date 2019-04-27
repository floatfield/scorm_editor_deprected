function findAPI(win) {
    let findAPITries = 0;
    while (
        !win.API &&
        win.parent &&
        win.parent !== win
    ) {
        findAPITries++;
        if (findAPITries > 7) {
            console.error("Error finding API -- too deeply nested.");
            return null;
        }
        win = win.parent;
    }
    return win.API;
}

function getAPI() {
    let theAPI = findAPI(window);
    if (
        !theAPI &&
        window.opener &&
        typeof (window.opener) !== "undefined"
    ) {
        theAPI = findAPI(window.opener);
    }
    if (!theAPI) {
        console.error("Unable to find an API adapter");
    }
    return theAPI;
}

const SCORM_TRUE = "true";
const SCORM_FALSE = "false";

export function scormProcessInitialize() {
    const API = getAPI();
    if (!API) {
        console.error("ERROR - Could not establish a connection with the LMS.\n\nYour results may not be recorded.");
        return;
    }
    const result = API.LMSInitialize("");
    if (result === SCORM_FALSE) {
        logError(API);
        return;
    }
    return API;
}

export function scormProcessFinish(API) {
    const result = API.LMSFinish("");
    if (result === SCORM_FALSE) {
        logError(API);
        return;
    }
}

function logError(API) {
    const errorNumber = API.LMSGetLastError();
    const errorString = API.LMSGetErrorString(errorNumber);
    const diagnostic = API.LMSGetDiagnostic(errorNumber);
    const errorDescription = `Number: ${errorNumber}\nDescription: ${errorString}\nDiagnostic: ${diagnostic}`;
    console.error("Error - Could not initialize communication with the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
}
