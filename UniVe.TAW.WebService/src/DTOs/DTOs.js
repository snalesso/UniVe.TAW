"use strict";
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
    function UserDto(Id, Username, Age, CountryId) {
        this.Id = Id;
        this.Username = Username;
        this.Age = Age;
        this.CountryId = CountryId;
    }
    return UserDto;
}());
exports.UserDto = UserDto;
// export class MatchCreationRequestDto {
//     public constructor(
//         public readonly PlayerId: string) {
//     }
// }
var PendingMatchDto = /** @class */ (function () {
    function PendingMatchDto(Id, PlayerId) {
        this.Id = Id;
        this.PlayerId = PlayerId;
    }
    return PendingMatchDto;
}());
exports.PendingMatchDto = PendingMatchDto;
var JoinPendingMatchRequestDto = /** @class */ (function () {
    function JoinPendingMatchRequestDto(PendingMatchId, PlayerId) {
        this.PendingMatchId = PendingMatchId;
        this.PlayerId = PlayerId;
    }
    return JoinPendingMatchRequestDto;
}());
exports.JoinPendingMatchRequestDto = JoinPendingMatchRequestDto;
var MatchDto = /** @class */ (function () {
    function MatchDto(Id, FirstPlayerId, SecondPlayerId, CreationDateTime) {
        this.Id = Id;
        this.FirstPlayerId = FirstPlayerId;
        this.SecondPlayerId = SecondPlayerId;
        this.CreationDateTime = CreationDateTime;
    }
    return MatchDto;
}());
exports.MatchDto = MatchDto;
//# sourceMappingURL=DTOs.js.map