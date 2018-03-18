//import * as auth from '../../../../libs/UniVe.TAW.Framework/auth';
//import * as jquery from 'jquery';
//import '../../../../libs/UniVe.TAW.Framework/auth';
function signup() {
    var username = $('#signup-username').val();
    var password = $('#signup-password').val();
    var birthDateString = $('#signup-birthDate').val();
    var birthDate = new Date(birthDateString);
    var country = $('#signup-country').val();
    var sr = new unive.taw.framework.auth.SignupRequestDto(username, password, birthDate, country);
    if (sr.Password != $('#signup-passwordRepeated').val()) {
        throw new Error("passwords dont match!");
    }
    else {
        var s = {
            url: 'http://localhost:1631/api/users',
            data: sr,
            //headers: { 'Access-Control-Allow-Origin': 'http://localhost:1631/api/users' },
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