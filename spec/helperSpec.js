describe('helper stuff', function() {
    describe('random with range from 0 and up', function() {
        it('lower limit is 0', function() {
            expect(rand(2)).not.toBeLessThan(0)
        })
        it('upper limit is positive number', function() {
            expect(rand(2)).not.toBeGreaterThan(2)
        })
        it('if integer return integer', function() {
            expect(rand(2)).toEqual(jasmine.any(Number))
            expect(Number.isInteger(rand(2))).toBeTruthy()
        })
        it('if float return float', function() {
            expect(rand(2.2)).toEqual(jasmine.any(Number))
            expect(Number.isInteger(rand(2.2))).toBeFalsy()
        })
    })
    describe('random between two numbers', function() {
        it('both are integers and return integer', function() {
            expect(between(2, 3)).toEqual(jasmine.any(Number))
            expect(Number.isInteger(between(2, 3))).toBeTruthy()
        })
        it('at least one is a float so a float gets returned', function() {
            expect(between(2.2, 3.3)).toEqual(jasmine.any(Number))
            expect(Number.isInteger(between(2.2, 3.3))).toBeFalsy()
            expect(Number.isInteger(between(2.2, 3))).toBeFalsy()
        })
        it('both are positive', function() {
            expect(between(2, 3)).not.toBeLessThan(2)
            expect(between(2, 3)).not.toBeGreaterThan(3)
        })
        it('both are negative is allowed', function() {
            expect(between(-3, -2)).not.toBeLessThan(-3)
            expect(between(-3, -2)).not.toBeGreaterThan(-2)
        })
        it('lower limit is negative is allowed', function() {
            expect(between(-50, 50)).not.toBeLessThan(-50)
            expect(between(-50, 50)).not.toBeGreaterThan(50)
        })
        it('first number can be higher than second', function() {
            expect(between(2, -3)).not.toBeGreaterThan(2)
            expect(between(2, -3)).not.toBeLessThan(-3)
        })
    })
    describe('random velocity', function() {
        it('get a random Vector3 with values between -1 and 1', function() {
            const velo = rand_velocity()
            expect(velo).toEqual(jasmine.any(THREE.Vector3))
            expect(velo.x).not.toBeLessThan(-1)
            expect(velo.x).not.toBeGreaterThan(1)
            expect(velo.y).not.toBeLessThan(-1)
            expect(velo.y).not.toBeGreaterThan(1)
            expect(velo.z).not.toBeLessThan(-1)
            expect(velo.z).not.toBeGreaterThan(1)
        })
    })
})
