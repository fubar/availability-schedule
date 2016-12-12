// npm
const chai = require('chai');

const expect = chai.expect;

const AvailabilitySchedule = require('../src/AvailabilitySchedule.es6');

describe('AvailabilitySchedule', () => {

  const dateMinuteZero = '2000-01-01T00:00:00Z';
  const dateMinute10 = '2000-01-01T00:10:00Z';
  const dateMinute20 = '2000-01-01T00:20:00Z';
  const dateMinute30 = '2000-01-01T00:30:00Z';
  const dateMinute40 = '2000-01-01T00:40:00Z';
  const dateMinute50 = '2000-01-01T00:50:00Z';

  describe('#addAvailability', () => {

    it('should accept a single availability', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute10);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10}
      ]);
    });

    it('should accept and sort multiple availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinute20, dateMinute30);
      as.addAvailability(dateMinuteZero, dateMinute10);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10},
        {start: dateMinute20, end: dateMinute30}
      ]);
    });

    it('should combine partially overlapping availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute20);
      as.addAvailability(dateMinute10, dateMinute30);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute30}
      ]);
    });

    it('should combine fully overlapping availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute30);
      as.addAvailability(dateMinute10, dateMinute20);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute30}
      ]);
    });

    it('should combine identical availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute10);
      as.addAvailability(dateMinuteZero, dateMinute10);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10}
      ]);
    });

    it('should combine adjacent availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute10);
      as.addAvailability(dateMinute10, dateMinute20);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute20}
      ]);
    });

    it('should trim an availability that overlaps at the start of the schedule', () => {
      let as = new AvailabilitySchedule(dateMinute10, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute20);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinute10, end: dateMinute20}
      ]);
    });

    it('should trim an availability that overlaps at the end of the schedule', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute20);

      as.addAvailability(dateMinute10, dateMinute30);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinute10, end: dateMinute20}
      ]);
    });

    it('should trim an availability that overlaps at both ends of the schedule', () => {
      let as = new AvailabilitySchedule(dateMinute10, dateMinute20);

      as.addAvailability(dateMinuteZero, dateMinute30);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinute10, end: dateMinute20}
      ]);
    });
  });


  describe('#removeAvailability', () => {

    it('should succeed on an empty schedule', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.removeAvailability(dateMinuteZero, dateMinute10);

      expect(as.getAvailabilities()).to.eql([]);
    });

    it('should have no effect on unavailable times', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute10);
      as.removeAvailability(dateMinute20, dateMinute30);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10}
      ]);
    });

    it('should have no effect on adjacent availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute10);
      as.addAvailability(dateMinute20, dateMinute30);

      as.removeAvailability(dateMinute10, dateMinute20);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10},
        {start: dateMinute20, end: dateMinute30}
      ]);
    });

    it('should shorten an availability at its end (matching end times)', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute20);
      as.removeAvailability(dateMinute10, dateMinute20);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10}
      ]);
    });

    it('should shorten an availability at its end (differing end times)', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute20);
      as.removeAvailability(dateMinute10, dateMinute30);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10}
      ]);
    });

    it('should shorten an availability at its start (matching start times)', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute20);
      as.removeAvailability(dateMinuteZero, dateMinute10);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinute10, end: dateMinute20}
      ]);
    });

    it('should shorten an availability at its start (differing start times)', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinute10, dateMinute30);
      as.removeAvailability(dateMinuteZero, dateMinute20);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinute20, end: dateMinute30}
      ]);
    });

    it('should remove a matching availability', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute10);
      as.removeAvailability(dateMinuteZero, dateMinute10);

      expect(as.getAvailabilities()).to.eql([]);
    });

    it('should remove a fully overlapped availability', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinute10, dateMinute20);
      as.removeAvailability(dateMinuteZero, dateMinute30);

      expect(as.getAvailabilities()).to.eql([]);
    });

    it('should split up a fully overlapping availability', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute30);
      as.removeAvailability(dateMinute10, dateMinute20);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10},
        {start: dateMinute20, end: dateMinute30}
      ]);
    });

    it('should shorten multiple overlapping availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute20);
      as.addAvailability(dateMinute30, dateMinute50);

      as.removeAvailability(dateMinute10, dateMinute40);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10},
        {start: dateMinute40, end: dateMinute50}
      ]);
    });

    it('should shorten an overlapping and remove an overlapped availability', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);

      as.addAvailability(dateMinuteZero, dateMinute20);
      as.addAvailability(dateMinute30, dateMinute40);

      as.removeAvailability(dateMinute10, dateMinute40);

      expect(as.getAvailabilities()).to.eql([
        {start: dateMinuteZero, end: dateMinute10}
      ]);
    });
  });


  describe('#isAvailable', () => {

    it('should return false for an empty schedule', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      expect(as.isAvailable(dateMinuteZero, dateMinute10)).to.eql(false);
    });

    it('should return false for an unavailable time', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinuteZero, dateMinute10);
      expect(as.isAvailable(dateMinute20, dateMinute30)).to.eql(false);
    });

    it('should return false for an availability that\'s adjacent at its end', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinuteZero, dateMinute10);
      expect(as.isAvailable(dateMinute10, dateMinute20)).to.eql(false);
    });

    it('should return false for an availability that\'s adjacent at its start', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinute10, dateMinute20);
      expect(as.isAvailable(dateMinuteZero, dateMinute10)).to.eql(false);
    });

    it('should return false for an availability partially overlapping at its end', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinuteZero, dateMinute20);
      expect(as.isAvailable(dateMinute10, dateMinute30)).to.eql(false);
    });

    it('should return false for an availability partially overlapping at its start', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinute10, dateMinute30);
      expect(as.isAvailable(dateMinuteZero, dateMinute20)).to.eql(false);
    });

    it('should return false for a time range starting and ending in different availabilities', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinuteZero, dateMinute20);
      as.addAvailability(dateMinute30, dateMinute50);
      expect(as.isAvailable(dateMinute10, 30)).to.eql(false);
    });

    it('should return true for a matching availability', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinuteZero, dateMinute10);
      expect(as.isAvailable(dateMinuteZero, dateMinute10)).to.eql(true);
    });

    it('should return true for a fully overlapping availability', () => {
      let as = new AvailabilitySchedule(dateMinuteZero, dateMinute50);
      as.addAvailability(dateMinuteZero, dateMinute30);
      expect(as.isAvailable(dateMinute10, dateMinute20)).to.eql(true);
    });
  });
});
