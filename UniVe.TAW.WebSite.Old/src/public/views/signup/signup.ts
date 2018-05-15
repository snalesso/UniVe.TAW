import * as auth from '../../../libs/unive.taw.framework/auth';
import * as $ from 'jquery';

let countries = Object.keys(auth.Country).map(countryName => ({ id: auth.Country[countryName], name: countryName }));

function signup() {
    let username = $('#signup-username').val() as string;
    let password = $('#signup-password').val() as string;
    let birthDateString = $('#signup-birthDate').val() as string;
    let birthDate = new Date(birthDateString);
    let countryId = $('#signup-country').val() as number;

    let sr = new auth.SignupRequestDto();
    sr.Username = username;
    sr.Password = password;
    sr.BirthDate = birthDate;
    sr.CountryId = countryId;

    if (sr.Password != $('#signup-passwordRepeated').val()) {
        throw new Error("passwords dont match!");
    }
    else {
        var s: $.JQueryAjaxSettings = {
            url: 'http://localhost:1632/api/users',
            data: sr,
            //headers: { 'Access-Control-Allow-Origin': 'http://localhost:1632/api/users' },
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