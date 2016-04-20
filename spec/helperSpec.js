describe('helper stuff', function() {
  describe('random with range from 0 and up', function() {
    it('lower limit is 0', function() {
      expect(rand(2)).not.toBeLessThan(0)
    })
    it('upper limit is positive number', function() {
      expect(rand(2)).not.toBeGreaterThan(2)
    })
  })
  describe('random with range between two numbers', function() {
    it('both are positive', function() {
      expect(between(2,3)).not.toBeLessThan(2)
      expect(between(2,3)).not.toBeGreaterThan(3)
    })
    it('both are negative', function() {
      expect(between(-3,-2)).not.toBeLessThan(-3)
      expect(between(-3,-2)).not.toBeGreaterThan(-2)
    })
    it('lower limit is negative', function() {
      expect(between(-50,50)).not.toBeLessThan(-50)
      expect(between(-50,50)).not.toBeGreaterThan(50)
    })
    it('first number is lower', function() {
      expect(between(2,-3)).not.toBeGreaterThan(2)
      expect(between(2,-3)).not.toBeLessThan(-3)
    })
  })
})
