export interface CurrentRoute {
    name: string;
    uri: string;
    parameters: Record<string, string>;
    methods: ("get" | "post" | "patch" | "put" | "delete")[]
}

type RouteDef = {
    uri: string;
    parameters: string[];
}

export interface RoutesConfig {
    url: string;
    routes: Record<string, RouteDef>
}

declare global {
    interface Window {
        routesConfig: Partial<RoutesConfig>;
        currentRoute: CurrentRoute;
    }
}