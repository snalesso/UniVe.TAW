export default class ServiceEventKeys {

    public static readonly WhoAreYou = "WhoAreYou";
    public static readonly WhoIAm = "WhoIAm";
    public static readonly PendingMatchesChanged = "PendingMatchesChanged";
    public static readonly MatchReady = "MatchReady";
    public static readonly MatchStarted = "MatchStarted";
    public static readonly MatchUpdated = "MatchUpdated";
    public static readonly YouGotShot = "YouGotShot";
    public static readonly MatchEnded = "MatchEnded";
    public static readonly MatchCanceled = "MatchCanceled";
    public static readonly YouGotANewMessage = "YouGotANewMessage";
    public static readonly BanUpdated = "BanUpdated";
    public static readonly RolesUpdated = "RolesUpdated";
    public static readonly UserDeleted = "UserDeleted";

    public static matchEventForUser(subscribingUserId: string, matchId: string, matchEvent: string) {
        return "uid=" + subscribingUserId + "&mid=" + matchId + "&mek=" + matchEvent;
    }

    public static chatEventForUser(chatEvent: string, addresseeId: string, senderId?: string) {
        let x = "cek=" + chatEvent + "&aid=" + addresseeId;
        if (senderId)
            x += "&sid=" + senderId;

        return x;
    }

    public static userEvent(subscribingUserId: string, userEvent: string) {
        return "uid=" + subscribingUserId + "&uek=" + userEvent;
    }
}