export default class RoutingHelper {

    public static readonly PathChunksSep: string = "/";
    public static readonly ArgKeysSep: string = RoutingHelper.PathChunksSep + ":";

    public static buildRoutePath(pathChunks: string[], argKeys?: string[]): string {
        if (!pathChunks || pathChunks.length <= 0)
            throw new Error("Invalid path chunks");
        let path = pathChunks.join(RoutingHelper.ArgKeysSep);
        let args = this.concatArgs(argKeys);

        return path + this.concatArgs(argKeys);
    }

    public static concatArgs(argKeys: string[]): string {
        if (!argKeys || argKeys.length <= 0)
            return "";
        return RoutingHelper.ArgKeysSep + argKeys.join(RoutingHelper.ArgKeysSep)
    }
}