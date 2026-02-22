import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from '../components/common/PasswordStrengthMeter';

describe('validatePasswordStrength', () => {
  it('returns all 5 rules for empty string', () => {
    const unmet = validatePasswordStrength('');
    expect(unmet).toHaveLength(5);
    expect(unmet).toContain('At least 8 characters');
    expect(unmet).toContain('Uppercase letter');
    expect(unmet).toContain('Lowercase letter');
    expect(unmet).toContain('Number');
    expect(unmet).toContain('Special character');
  });

  it('passes length check for 8+ chars', () => {
    const unmet = validatePasswordStrength('abcdefgh');
    expect(unmet).not.toContain('At least 8 characters');
    expect(unmet).toContain('Uppercase letter');
    expect(unmet).toContain('Number');
    expect(unmet).toContain('Special character');
  });

  it('passes all rules for a strong password', () => {
    const unmet = validatePasswordStrength('MyP@ss1234');
    expect(unmet).toHaveLength(0);
  });

  it('fails for 7-char password', () => {
    const unmet = validatePasswordStrength('Ab1!xyz');
    expect(unmet).toContain('At least 8 characters');
  });

  it('detects missing uppercase', () => {
    const unmet = validatePasswordStrength('mypass1234!');
    expect(unmet).toContain('Uppercase letter');
    expect(unmet).not.toContain('Lowercase letter');
    expect(unmet).not.toContain('Number');
    expect(unmet).not.toContain('Special character');
  });

  it('detects missing lowercase', () => {
    const unmet = validatePasswordStrength('MYPASS1234!');
    expect(unmet).toContain('Lowercase letter');
    expect(unmet).not.toContain('Uppercase letter');
  });

  it('detects missing number', () => {
    const unmet = validatePasswordStrength('MyPassWord!');
    expect(unmet).toContain('Number');
    expect(unmet).not.toContain('Special character');
  });

  it('detects missing special character', () => {
    const unmet = validatePasswordStrength('MyPass1234');
    expect(unmet).toContain('Special character');
    expect(unmet).not.toContain('Number');
  });
});
