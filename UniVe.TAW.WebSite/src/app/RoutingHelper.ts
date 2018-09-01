export default class RoutingHelper {

    // param is the key, arg is the value

    public static readonly PathStepsSep: string = "/";
    public static readonly ParamKeysSep: string = RoutingHelper.PathStepsSep + ":";

    public static buildRoutePath(pathSteps: string[], paramKeys?: string[]): string {
        if (!pathSteps || pathSteps.length <= 0)
            throw new Error("Invalid path chunks");

        return pathSteps.join(RoutingHelper.ParamKeysSep) + this.buildQueryString(paramKeys);
    }

    public static buildQueryString(paramKeys: string[]): string {
        if (!paramKeys || paramKeys.length <= 0)
            return "";
        return RoutingHelper.ParamKeysSep + paramKeys.join(RoutingHelper.ParamKeysSep)
    }
}