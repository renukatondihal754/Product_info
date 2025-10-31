/**
 * Unit Tests for Rule Engine
 * Tests rule-based scoring logic
 */

const { scoreRole, scoreIndustry, scoreCompleteness, calculateRuleScore } = require('../src/services/ruleEngine');

describe('Rule Engine Tests', () => {
  describe('scoreRole', () => {
    test('should score CEO as decision maker (20 points)', () => {
      const result = scoreRole('CEO');
      expect(result.score).toBe(20);
      expect(result.type).toBe('Decision Maker');
    });

    test('should score Manager as influencer (10 points)', () => {
      const result = scoreRole('Marketing Manager');
      expect(result.score).toBe(10);
      expect(result.type).toBe('Influencer');
    });

    test('should score unknown role as other (0 points)', () => {
      const result = scoreRole('Intern');
      expect(result.score).toBe(0);
      expect(result.type).toBe('Other');
    });

    test('should handle empty role', () => {
      const result = scoreRole('');
      expect(result.score).toBe(0);
      expect(result.type).toBe('Unknown');
    });
  });

  describe('scoreIndustry', () => {
    test('should score exact ICP match (20 points)', () => {
      const result = scoreIndustry('B2B SaaS', ['B2B SaaS mid-market']);
      expect(result.score).toBe(20);
      expect(result.match).toBe('Exact ICP match');
    });

    test('should score adjacent industry (10 points)', () => {
      const result = scoreIndustry('Enterprise Software', ['B2B SaaS']);
      expect(result.score).toBe(10);
      expect(result.match).toBe('Adjacent industry');
    });

    test('should score different industry (0 points)', () => {
      const result = scoreIndustry('Manufacturing', ['B2B SaaS']);
      expect(result.score).toBe(0);
      expect(result.match).toBe('Different industry');
    });
  });

  describe('scoreCompleteness', () => {
    test('should give 10 points for complete data', () => {
      const lead = {
        name: 'John Doe',
        role: 'CEO',
        company: 'TechCorp',
        industry: 'SaaS',
        location: 'San Francisco',
        linkedin_bio: 'Experienced CEO'
      };
      const result = scoreCompleteness(lead);
      expect(result.score).toBe(10);
      expect(result.complete).toBe(true);
    });

    test('should give 0 points for incomplete data', () => {
      const lead = {
        name: 'John Doe',
        role: '',
        company: 'TechCorp',
        industry: 'SaaS',
        location: '',
        linkedin_bio: ''
      };
      const result = scoreCompleteness(lead);
      expect(result.score).toBe(0);
      expect(result.complete).toBe(false);
    });
  });

  describe('calculateRuleScore', () => {
    test('should calculate total score correctly', () => {
      const lead = {
        name: 'Jane Smith',
        role: 'CTO',
        company: 'StartupX',
        industry: 'B2B SaaS',
        location: 'New York',
        linkedin_bio: 'Tech leader with 10+ years experience'
      };
      const offer = {
        name: 'AI Tool',
        value_props: ['Fast', 'Reliable'],
        ideal_use_cases: ['B2B SaaS mid-market']
      };

      const result = calculateRuleScore(lead, offer);
      expect(result.total).toBeGreaterThanOrEqual(40); // At least role (20) + industry (20)
      expect(result.breakdown).toHaveProperty('role');
      expect(result.breakdown).toHaveProperty('industry');
      expect(result.breakdown).toHaveProperty('completeness');
    });
  });
});