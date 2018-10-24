export default class ServiceEventKeys {

    public static readonly WhoAreYou = "WhoAreYou";
    public static readonly WhoIAm = "WhoIAm";
    public static readonly PendingMatchesChanged = "PendingMatchesChanged";
    public static readonly MatchReady = "MatchReady";
    public static readonly MatchStarted = "MatchStarted";
    public static readonly MatchUpdated = "MatchUpdated";
    public static readonly YouGotShot = "YouGotShot";
    public static readonly MatchEnded = "MatchEnded";
    public static readonly YouGotANewMessage = "YouGotANewMessage";

    public static matchEventForUser(subscribingUserId: string, matchId: string, matchEvent: string) {
        return "uid=" + subscribingUserId + "&mid=" + matchId + "&mek=" + matchEvent;
    }

    public static chatEventForUser(subscribingUserId: string, chatEvent: string) {
        return "uid=" + subscribingUserId + "&cek=" + chatEvent;
    }
}