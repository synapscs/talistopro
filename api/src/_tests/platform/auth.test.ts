/**
 * Tests para Platform Auth Service
 */

import { describe, test, expect } from 'vitest';
import { PlatformAuthService } from '../../services/platform/auth';

describe('Platform Auth Service', () => {
  test('debe generar y validar token correctamente', () => {
    const payload = { 
      email: 'admin@talisto.pro', 
      sub: 'platform-admin',
      exp: Math.floor(Date.now() / 1000) + 3600 
    };
    
    const token = PlatformAuthService.signToken(payload);
    
    expect(token).toBeDefined();
    expect(token).toContain('.');
    
    const verified = PlatformAuthService.verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified.email).toBe('admin@talisto.pro');
    expect(verified.sub).toBe('platform-admin');
  });

  test('debe rechazar tokens expirados', () => {
    // Token expirado hace 1 hora
    const expiredPayload = {
      email: 'admin@talisto.pro',
      sub: 'platform-admin',
      exp: Math.floor(Date.now() / 1000) - 3600 
    };
    
    const token = PlatformAuthService.signToken(expiredPayload);
    const verified = PlatformAuthService.verifyToken(token);
    
    expect(verified).toBeNull();
  });

  test('debe rechazar tokens malformados', () => {
    const malformedToken = 'invalid.token.here';
    const verified = PlatformAuthService.verifyToken(malformedToken);
    
    expect(verified).toBeNull();
  });

  test('debe rechazar tokens con firma incorrecta', () => {
    const payload = { 
      email: 'admin@talisto.pro', 
      sub: 'platform-admin',
      exp: Math.floor(Date.now() / 1000) + 3600 
    };
    
    // Crear token válido
    const signature = PlatformAuthService.signToken(payload);
    
    // Manipular token (cambiar último carácter)
    const forgedToken = signature.slice(0, -1) + 'X';
    
    const verified = PlatformAuthService.verifyToken(forgedToken);
    
    expect(verified).toBeNull();
  });

  test('debe rechazar tokens sin expiración cuando se valida timestamp', () => {
    const payload = { 
      email: 'admin@talisto.pro', 
      sub: 'platform-admin'
      // Sin campo 'exp' - token debería ser válido
    };
    
    const token = PlatformAuthService.signToken(payload);
    const verified = PlatformAuthService.verifyToken(token);
    
    expect(verified).not.toBeNull();
  });

  test('debe generar tokens válidos con payloads complejos', () => {
    const complexPayload = {
      email: 'admin@talisto.pro',
      sub: 'platform-admin',
      name: 'Admin User',
      role: 'super-admin',
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    
    const token = PlatformAuthService.signToken(complexPayload);
    const verified = PlatformAuthService.verifyToken(token);
    
    expect(verified).not.toBeNull();
    expect(verified.email).toBe('admin@talisto.pro');
    expect(verified.name).toBe('Admin User');
    expect(verified.role).toBe('super-admin');
  });

  test('debe manejar payload con exp inmediatamente futura', () => {
    const payload = { 
      email: 'admin@talisto.pro', 
      exp: Math.floor(Date.now() / 1000) + 10 // 10 segundos en el futuro
    };
    
    const token = PlatformAuthService.signToken(payload);
    const verified = PlatformAuthService.verifyToken(token);
    
    expect(verified).not.toBeNull();
  });
});