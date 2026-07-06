import { useMemo } from 'react';
import { CurrentRoute, RoutesConfig } from './types';

const Spark = function() {
    let rootEl = null;
    let routesConfig: Partial<RoutesConfig> = {};
    let currentRoute: CurrentRoute | null = null;

    const route = function(name: string, params: string[]|object = {}) {
        const routeDef = routesConfig.routes ? routesConfig.routes[name] : null;
        
        if (!routeDef) {
            console.error(`Route "${name}" not found.`);
            return '#';
        }

        let uri = routeDef.uri;

        const routeParams: string[] = routeDef.parameters || [];

        // Extraire tous les paramètres de l'URI (requis + optionnels)
        const uriParams: string[] = (uri.match(/\/\??:([a-zA-Z_][a-zA-Z0-9_]*)/g) || [])
                                        .map(p => p.replace(/^\/\??:/, ''));

        // Union des deux pour avoir la liste complète
        const allParams = [...new Set([...routeParams, ...uriParams])];

        const normalizedParams: Record<string, any> = Array.isArray(params)
            ? Object.fromEntries(allParams.map((n, i) => [n, params[i]]))
            : params;
        
        for (const n of allParams) {
            const value = normalizedParams[n];

            if (value !== undefined && value !== null) {
                uri = uri.replace(new RegExp(`\\/\\?:${n}|\\/:${n}`, 'g'), '/' + encodeURIComponent(value));
            } else {
                if (uri.includes(`/?:${n}`)) {
                    // Optionnel absent → on supprime le segment
                    uri = uri.replace(`/?:${n}`, '');
                } else {
                    // Requis absent → warn
                    console.warn(`Missing required parameter "${n}" for route "${name}"`);
                    uri = uri.replace(`/:${n}`, '');
                }
            }
        }

        // Seuls les keys qui ne sont ni dans routeParams ni dans uriParams → query string
        const queryKeys = Object.keys(normalizedParams).filter(k => !allParams.includes(k));
        const searchParams = new URLSearchParams();
        
        for (const key of queryKeys) {
            const value = normalizedParams[key];
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        }

        const queryString = searchParams.toString();
        const basePath = routesConfig.url || '';
        
        // L'URI commence déjà par '/', donc pas de '/' supplémentaire
        return `${basePath}${uri}${queryString ? '?' + queryString : ''}`;
    }

    const current = function(name: string|null = null) {
        if (name) {
            return window.currentRoute?.name === name ? window.currentRoute : null;
        }
        return window.currentRoute;
    }

    const currentUrl = function() {
        if (!currentRoute) return routesConfig.url || '';

        const { uri, parameters } = currentRoute;
        let url = uri;

        for (const name in parameters) {
            const value = parameters[name];
            const regex = new RegExp(`:${name}`, 'g');
            if (value !== undefined && value !== null) {
                url = url.replace(regex, encodeURIComponent(value));
            }
        }

        return `${routesConfig.url || ''}/${url}`;
    }

    const useRoute = (configOverride = null) => {
        // useMemo(() => {
        //     if (configOverride) {
        //         routesConfig = configOverride;
        //     }
        // }, [configOverride]);
        if (configOverride) {
                routesConfig = configOverride;
            }

        return route;
    }

    return {
        init() {
            rootEl = document.getElementById('app');

            if (!rootEl || !rootEl.dataset.routes) {
                throw new Error(
                    "init: Unable to find the configuration. Make sure you have a 'data-routes' attribute on the #root div."
                );
            }

            try {
                routesConfig = JSON.parse(rootEl.dataset.routes || '{}');
                currentRoute = JSON.parse(rootEl.dataset.currentroute || 'null');

                window.routesConfig = routesConfig;
                window.currentRoute = currentRoute!;
            } catch (error) {
                throw new Error("init: The contents of 'data-routes' are not valid JSON.");
            }
        },
        route,
        current,
        currentUrl,
        useRoute
    }
}();

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', Spark.init);
// } else {
//     Spark.init();
// }

export const route = Spark.route;
export const current = Spark.current;
export const currentUrl = Spark.currentUrl;
export const useRoute = Spark.useRoute;