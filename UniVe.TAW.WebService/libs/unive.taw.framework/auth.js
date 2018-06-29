"use strict";
// export function alertBla() {
//     alert("bla");
//     console.log("bla");
// }
Object.defineProperty(exports, "__esModule", { value: true });
var SignupRequestDto = /** @class */ (function () {
    function SignupRequestDto(Username, Password, BirthDate, CountryId) {
        this.Username = Username;
        this.Password = Password;
        this.BirthDate = BirthDate;
        this.CountryId = CountryId;
    }
    return SignupRequestDto;
}());
exports.SignupRequestDto = SignupRequestDto;
var UserDto = /** @class */ (function () {
    function UserDto(Id, Username, Age, 
    //public readonly Roles: UserRoles,
    CountryId) {
        this.Id = Id;
        this.Username = Username;
        this.Age = Age;
        this.CountryId = CountryId;
    }
    return UserDto;
}());
exports.UserDto = UserDto;
//# sourceMappingURL=auth.js.map