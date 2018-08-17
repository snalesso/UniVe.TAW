export default class RoutingHelper {

    public static readonly PathChunksSep: string = "/";
    public static readonly ArgsSep: string = RoutingHelper.PathChunksSep + ":";

    public static buildRoutePath(paths: string[], params?: string[]): string {
        if (!paths || paths.length <= 0)
            throw new Error("Invalid path chunks");
        let path = paths.join(RoutingHelper.ArgsSep);
        let args = this.concatArgs(params);

        return path + this.concatArgs(params);
    }

    public static concatArgs(params: string[]): string {
        if (!params || params.length <= 0)
            return "";
        return RoutingHelper.ArgsSep + params.join(RoutingHelper.ArgsSep)
    }
}