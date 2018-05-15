"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth = require("../../../libs/unive.taw.framework/auth");
var $ = require("jquery");
var countries = Object.keys(auth.Country).map(function (countryName) { return ({ id: auth.Country[countryName], name: countryName }); });
function signup() {
    var username = $('#signup-username').val();
    var password = $('#signup-password').val();
    var birthDateString = $('#signup-birthDate').val();
    var birthDate = new Date(birthDateString);
    var countryId = $('#signup-country').val();
    var sr = new auth.SignupRequestDto();
    sr.Username = username;
    sr.Password = password;
    sr.BirthDate = birthDate;
    sr.CountryId = countryId;
    if (sr.Password != $('#signup-passwordRepeated').val()) {
        throw new Error("passwords dont match!");
    }
    else {
        var s = {
            url: 'http://localhost:1632/api/users',
            data: sr,
            //headers: { 'Access-Control-Allow-Origin': 'http://localhost:1632/api/users' },
            method: 'POST',
            crossDomain: true,
            async: true,
            //dataType: 'jsonp',
            dataType: 'json',
            success: function (response) {
                if (response.error) {
                    $('#responseError').html(JSON.stringify(response.error));
                }
            },
            error: function (response) {
                var greger = "few";
            }
        };
        $.ajax(s);
    }
}
//# sourceMappingURL=signup.js.map