export default class ServiceConstants {
    public static readonly ServerAddress = "http://" + (process.env.ServerAddress || "127.0.0.1") + ":1632";
}