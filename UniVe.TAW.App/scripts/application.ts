// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
"use strict";

export function initialize(): void {
    document.addEventListener('deviceready', onDeviceReady, false);
}

function onDeviceReady(): void {
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);

    // mine

    let btn = document.getElementById("btnSendChatMessage");
    btn.addEventListener("click", (event) => {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", "http://localhost:1632/SendMessage", true);
        xhr.setRequestHeader("Content-type", "application/json");

        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                alert(xhr.responseText);
            }
        }
        xhr.send(JSON.stringify({ content: "This is a message sent from Android app" }));
        navigator.notification.alert("navigator alert", () => { }, "reger", "fewfe");
    });
}

function onPause(): void {
    // TODO: This application has been suspended. Save application state here.
}

function onResume(): void {
    // TODO: This application has been reactivated. Restore application state here.
}