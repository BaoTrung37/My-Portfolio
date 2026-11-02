import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { HealthService } from '../../src/modules/health/health.service.js';

describe('HealthService Unit Tests', () => {
  test('returns UP and CONNECTED when database is healthy', async () => {
    const mockDbCheck = async () => true;
    const service = new HealthService(mockDbCheck);

    const health = await service.getHealth();
    assert.strictEqual(health.status, 'UP');
    assert.strictEqual(health.database, 'CONNECTED');
    assert.ok(typeof health.uptimeSeconds === 'number');
    assert.ok(health.uptimeSeconds >= 0);
    assert.strictEqual(health.version, '1.0.0');
  });

  test('returns DOWN and DISCONNECTED when database check fails', async () => {
    const mockDbCheck = async () => false;
    const service = new HealthService(mockDbCheck);

    const health = await service.getHealth();
    assert.strictEqual(health.status, 'DOWN');
    assert.strictEqual(health.database, 'DISCONNECTED');
  });
});
