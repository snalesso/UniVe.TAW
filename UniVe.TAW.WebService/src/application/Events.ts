export default class Events {

    public static readonly PendingMatchesChanged = "PendingMatchesChanged";
    public static readonly PendingMatchJoined = "PendingMatchJoined";

    //public static readonly MatchReady = "MatchReady";
    public static readonly MatchStarted = "MatchStarted";
    //public static readonly MatchUpdated = "MatchUpdated";
    public static readonly YouGotShot = "YouGotShot";
    //public static readonly MatchEnded = "MatchEnded";
    public static readonly MatchCanceled = "MatchCanceled";

    public static readonly YouGotANewMessage = "YouGotANewMessage";

    public static readonly UserBanned = "UserBanned";
    public static readonly UserRoleUpdated = "UserRoleUpdated";
    public static readonly UserDeleted = "UserDeleted";

    public static pendingMatchJoined(subscribingUserId: string, pendingMatchid: string) {
        return "uid=" + subscribingUserId + "&pmid=" + pendingMatchid + "&pmek=" + this.PendingMatchJoined;
    }

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