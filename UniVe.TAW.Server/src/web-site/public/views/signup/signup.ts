//import * as auth from '../../../../libs/UniVe.TAW.Framework/auth';
//import * as jquery from 'jquery';
//import '../../../../libs/UniVe.TAW.Framework/auth';

function signup() {
    let username = $('#signup-username').val() as string;
    let password = $('#signup-password').val() as string;
    let birthDateString = $('#signup-birthDate').val() as string;
    let birthDate = new Date(birthDateString);
    let country = $('#signup-country').val() as string;

    let sr = new unive.taw.framework.auth.SignupRequestDto(username, password, birthDate, country);

    if (sr.Password != $('#signup-passwordRepeated').val()) {
        throw new Error("passwords dont match!");
    }
    else {
        var s: JQueryAjaxSettings = {
            url: 'http://localhost:1631/api/users',
            data: sr,
            //headers: { 'Access-Control-Allow-Origin': 'http://localhost:1631/api/users' },
            method: 'POST',
            crossDomain: true,
            async: true,
            //dataType: 'jsonp',
            dataType: 'json',
            success: (response) => {
                if (response.error) {
                    $('#responseError').html(JSON.stringify(response.error));
                }
            },
            error: (response) => {
                let greger = "few";
            }
        };
        $.ajax(s);
    }
}