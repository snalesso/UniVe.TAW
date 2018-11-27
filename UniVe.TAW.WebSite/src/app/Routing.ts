export class RoutingHelper {

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

    public static buildRoute(routePieces: RoutePiece[]): string {
        if (!routePieces || routePieces.length <= 0)
            throw new Error("Invalid route pieces");

        let route = "";

        let rp: RoutePiece;
        for (let rpi = 0; rpi < routePieces.length; rpi++) {

            rp = routePieces[rpi];

            if (rp instanceof RouteStep) {
                route += rp.Key;
            }
            else if (rp instanceof RouteParam) {
                route += ":" + rp.Key;
            }

            if (rpi < (routePieces.length - 1))
                route += this.PathStepsSep;

            // switch(typeof rp){
            //     case typeof RouteStep:
            // }
        }

        return route;
    }
}

abstract class RoutePiece {

    public constructor(private readonly _key: string) {
    }

    public get Key(): string { return this._key; }
}

export class RouteStep extends RoutePiece { }

export class RouteParam extends RoutePiece { }