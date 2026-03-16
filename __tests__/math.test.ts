import { calculateCompoundInterest, projectDividends } from '@/lib/math';

describe('Financial Math Module', () => {
  describe('calculateCompoundInterest', () => {
    it('calculates compound interest correctly without monthly contribution', () => {
      // Principal R$ 10,000, 10% annual rate, 5 years
      const result = calculateCompoundInterest(10000, 0, 0.10, 5);
      // Formula: 10000 * (1 + 0.10/12)^(5*12) = ~ 16453.089
      expect(result).toBeCloseTo(16453.089, 1);
    });

    it('calculates compound interest correctly with monthly contributions', () => {
      // Principal R$ 1,000, R$ 100/mo, 6% annual rate, 10 years
      const result = calculateCompoundInterest(1000, 100, 0.06, 10);
      // Principal part: 1000 * (1 + 0.005)^120 = 1819.39
      // Contribution part: 100 * ((1.005^120 - 1) / 0.005) = 16387.93
      // Total ~ 18207.33
      expect(result).toBeCloseTo(18207.33, 1);
    });
  });

  describe('projectDividends', () => {
    it('projects accurate dividend growth year over year', () => {
      const yieldRate = 0.06; // 6% yield on cost
      const years = 3;
      const initialInvested = 50000;
      const monthlyContribution = 1000;

      const projection = projectDividends(initialInvested, monthlyContribution, yieldRate, years);

      expect(projection).toHaveLength(years);
      
      // In Year 1:
      // Starting 50,000
      // 12 months adding 1000 + dividend reinvestment + market appreciation
      expect(projection[0].year).toBe(1);
      expect(projection[0].patrimony).toBeGreaterThan(initialInvested + (1000 * 12));
      expect(projection[0].annualDividends).toBeGreaterThan((initialInvested + 12000) * yieldRate);

      // Verify continuous growth
      expect(projection[2].patrimony).toBeGreaterThan(projection[1].patrimony);
      expect(projection[2].annualDividends).toBeGreaterThan(projection[1].annualDividends);
      
      // The monthly income should be exactly 1/12 of the annual dividend expected
      expect(projection[0].monthlyIncome).toBeCloseTo(projection[0].annualDividends / 12, 5);
    });

    it('handles zero initial investment to project purely from contributions', () => {
      const projection = projectDividends(0, 500, 0.05, 2);
      expect(projection).toHaveLength(2);
      expect(projection[0].patrimony).toBeGreaterThan(500 * 12); // Growth from reinvestment and appreciation
      expect(projection[1].monthlyIncome).toBeGreaterThan(0);
    });
  });
});
