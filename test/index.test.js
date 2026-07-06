import { describe, it, expect, beforeEach } from 'vitest';
import { useRoute } from '../index';

describe('route()', () => {
    const route = useRoute({
        routes: {
            'shifts.planning': {
                uri: '/shifts/planning/?:weekstart',
                parameters: ['weekstart']
            }
        }
    });
    beforeEach(() => {
        // Mock de routesConfig directement
    });

    it('remplace un paramètre requis', () => {
        expect(route('shifts.planning', { weekstart: '2026-01-01' }))
            .toBe('/shifts/planning/2026-01-01');
    });

    it('ignore un paramètre optionnel absent', () => {
        expect(route('shifts.planning', {}))
            .toBe('/shifts/planning');
    });

    it('met en query string les params inconnus', () => {
        expect(route('shifts.planning', { foo: 'bar' }))
            .toBe('/shifts/planning?foo=bar');
    });
});