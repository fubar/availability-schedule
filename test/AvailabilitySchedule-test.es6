// npm
const chai = require('chai');

const expect = chai.expect;

const AvailabilitySchedule = require('../lib/AvailabilitySchedule.es6');

describe('AvailabilitySchedule', () => {

  const dateMinuteZero = new Date('2000-01-01T00:00:00.000Z');
  const dateMinute10 = new Date('2000-01-01T00:10:00.000Z');
  const dateMinute20 = new Date('2000-01-01T00:20:00.000Z');
  const dateMinute30 = new Date('2000-01-01T00:30:00.000Z');
  const dateMinute40 = new Date('2000-01-01T00:40:00.000Z');
  const dateMinute50 = new Date('2000-01-01T00:50:00.000Z');

  describe('#addAvailability', () => {

    it('should accept a single availability', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10]
      ]);
    });

    it('should accept and sort multiple availabilities', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinute20, 10);
      as.addAvailability(dateMinuteZero, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10],
        [dateMinute20, dateMinute30]
      ]);
    });

    it('should combine partially overlapping availabilities', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 20);
      as.addAvailability(dateMinute10, 20);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute30]
      ]);
    });

    it('should combine fully overlapping availabilities', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 30);
      as.addAvailability(dateMinute10, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute30]
      ]);
    });

    it('should combine identical availabilities', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 10);
      as.addAvailability(dateMinuteZero, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10]
      ]);
    });

    it('should combine adjacent availabilities', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 10);
      as.addAvailability(dateMinute10, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute20]
      ]);
    });
  });


  describe('#removeAvailability', () => {

    it('should succeed on an empty schedule', () => {
      let as = new AvailabilitySchedule();

      as.removeAvailability(dateMinuteZero, 10);

      expect(as.getAvailabilities()).to.eql([]);
    });

    it('should have no effect on unavailable times', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 10);
      as.removeAvailability(dateMinute20, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10]
      ]);
    });

    it('should have no effect on adjacent availabilities', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 10);
      as.addAvailability(dateMinute20, 10);

      as.removeAvailability(dateMinute10, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10],
        [dateMinute20, dateMinute30]
      ]);
    });

    it('should shorten an availability at its end (matching end times)', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 20);
      as.removeAvailability(dateMinute10, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10]
      ]);
    });

    it('should shorten an availability at its end (differing end times)', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 20);
      as.removeAvailability(dateMinute10, 60);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10]
      ]);
    });

    it('should shorten an availability at its start (matching start times)', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 20);
      as.removeAvailability(dateMinuteZero, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinute10, dateMinute20]
      ]);
    });

    it('should shorten an availability at its start (differing start times)', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinute10, 20);
      as.removeAvailability(dateMinuteZero, 20);

      expect(as.getAvailabilities()).to.eql([
        [dateMinute20, dateMinute30]
      ]);
    });

    it('should remove a matching availability', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 10);
      as.removeAvailability(dateMinuteZero, 10);

      expect(as.getAvailabilities()).to.eql([]);
    });

    it('should remove a fully overlapped availability', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinute10, 10);
      as.removeAvailability(dateMinuteZero, 30);

      expect(as.getAvailabilities()).to.eql([]);
    });

    it('should split up a fully overlapping availability', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 30);
      as.removeAvailability(dateMinute10, 10);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10],
        [dateMinute20, dateMinute30]
      ]);
    });

    it('should shorten multiple overlapping availabilities', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 20);
      as.addAvailability(dateMinute30, 20);

      as.removeAvailability(dateMinute10, 30);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10],
        [dateMinute40, dateMinute50]
      ]);
    });

    it('should shorten an overlapping and remove an overlapped availability', () => {
      let as = new AvailabilitySchedule();

      as.addAvailability(dateMinuteZero, 20);
      as.addAvailability(dateMinute30, 10);

      as.removeAvailability(dateMinute10, 30);

      expect(as.getAvailabilities()).to.eql([
        [dateMinuteZero, dateMinute10]
      ]);
    });
  });


  describe('#isAvailable', () => {

    it('should return false for an empty schedule', () => {
      let as = new AvailabilitySchedule();
      expect(as.isAvailable(dateMinuteZero, 10)).to.eql(false);
    });

    it('should return false for an unavailable time', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinuteZero, 10);
      expect(as.isAvailable(dateMinute20, 10)).to.eql(false);
    });

    it('should return false for an availability that\'s adjacent at its end', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinuteZero, 10);
      expect(as.isAvailable(dateMinute10, 10)).to.eql(false);
    });

    it('should return false for an availability that\'s adjacent at its start', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinute10, 10);
      expect(as.isAvailable(dateMinuteZero, 10)).to.eql(false);
    });

    it('should return false for an availability partially overlapping at its end', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinuteZero, 20);
      expect(as.isAvailable(dateMinute10, 20)).to.eql(false);
    });

    it('should return false for an availability partially overlapping at its start', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinute10, 20);
      expect(as.isAvailable(dateMinuteZero, 20)).to.eql(false);
    });

    it('should return false for a time range starting and ending in different availabilities', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinuteZero, 20);
      as.addAvailability(dateMinute30, 20);
      expect(as.isAvailable(dateMinute10, 30)).to.eql(false);
    });

    it('should return true for a matching availability', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinuteZero, 10);
      expect(as.isAvailable(dateMinuteZero, 10)).to.eql(true);
    });

    it('should return true for a fully overlapping availability', () => {
      let as = new AvailabilitySchedule();
      as.addAvailability(dateMinuteZero, 30);
      expect(as.isAvailable(dateMinute10, 10)).to.eql(true);
    });
  });
});
