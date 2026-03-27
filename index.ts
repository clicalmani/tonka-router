import { useMemo } from 'react';
import { CurrentRoute, RoutesConfig } from './types';

const Spark = function() {
    let rootEl = null;
    let routesConfig: Partial<RoutesConfig> = {};
    let currentRoute: CurrentRoute | null = null;

    const route = function(name: string, params: string[]|object = {}) {
        const routeDef = routesConfig.routes ? routesConfig.routes[name]: null;
        
        if (!routeDef) {
            console.error(`Route "${name}" not found.`);
            return '#';
        }

        let uri = routeDef.uri; // ex: "users/:id"
        const routeParams = routeDef.parameters || [];

        // Parameter normalization: we accept object or positional array
        const normalizedParams: Record<string, any> = Array.isArray(params)
            ? Object.fromEntries(routeParams.map((name, i) => [name, params[i]]))
            : params;
        
        // Replacing required parameters in the URI
        for (const n of routeParams) {
            const value = normalizedParams[n];
            const regex = new RegExp(`:${n}`, 'g');
            
            if (value !== undefined && value !== null) {
                uri = uri.replace(regex, encodeURIComponent(value));
            } else {
                console.warn(`Missing required parameter "${n}" for route "${n}"`);
                uri = uri.replace(regex, ''); // ou tu peux laisser le placeholder
            }
        }

        // Query string handling for everything that is not a route parameter
        const queryKeys = Object.keys(normalizedParams).filter(k => !routeParams.includes(k));
        const searchParams = new URLSearchParams();
        
        for (const key of queryKeys) {
            const value = normalizedParams[key];

            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        }

        const queryString = searchParams.toString();
        const basePath = routesConfig.url || '';
        
        return `${basePath}/${uri}${queryString ? '?' + queryString : ''}`;
    }

    const current = function() {
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

        const basePath = routesConfig.url || '';

        return `${basePath}/${url}`;
    }

    /**
     * React hook to generate URLs based on a route configuration (Ziggy style).
     * 
     * @param {Object} [configOverride] - Optional: A complete configuration object to override the DOM one.
     * @returns {Function} - A route(name, params) function to generate URLs.
     */
    const useRoute = (configOverride = null) => {
        // Retrieving and processing the configuration
        // We use useMemo to avoid re-parsing the JSON on each render
        routesConfig = useMemo(() => {
            // If a configuration is passed explicitly, it is used (useful for testing or SSR).
            if (configOverride) {
                return configOverride;
            }

            return routesConfig;
        }, [configOverride]);

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
                window.currentRoute = currentRoute !;
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

if (document.readyState === 'loading') {
    // Loading phase: Wait for the event
    document.addEventListener('DOMContentLoaded', Spark.init);
} else {
    // DOM is already ready (interactive or complete)
    Spark.init();
}

const route = Spark.route
const current = Spark.current
const currentUrl = Spark.currentUrl
const useRoute = Spark.useRoute

export {
    route,
    current,
    currentUrl,
    useRoute
}