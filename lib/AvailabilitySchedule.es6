'use strict';

const moment = require('moment');
const DateRange = require('moment-range'); // eslint-disable-line no-unused-vars
require('moment-recur');

/**
 * @class AvailabilitySchedule
 * @author Philipp Gebauer https://github.com/fubar
 *
 * A simple availability schedule library
 *
 * See the readme for usage details.
 */
class AvailabilitySchedule {

  /** @member {Date} AvailabilitySchedule#startDate */
  /** @member {Date} AvailabilitySchedule#endDate */
  /** @member {DateRange[]} AvailabilitySchedule#availabilities */

  /**
   * @param {string} startDate Start date of the schedule as an ISO 8601 string
   * @param {string} endDate End date of the schedule as an ISO 8601 string
   */
  constructor (startDate, endDate) {
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.availabilities = [];
  }

  /**
   * @private
   */
  sortByStartDate () {
    this.availabilities = this.availabilities.sort(
      /**
       * @param {DateRange} a
       * @param {DateRange} b
       */
      (a, b) => {
        if (a.start < b.start) {
          return -1;
        }
        if (a.start > b.start) {
          return 1;
        }
        return 0;
      }
    );
  }

  /**
   * Returns the index of the first range that overlaps the given one.
   *
   * @param {DateRange[]} ranges
   * @param {DateRange} range
   * @private
   * @returns {number}
   */
  findIndexOfOverlappingRange (ranges, range) {
    return ranges.findIndex(current => {
      return range.overlaps(current);
    });
  }

  /**
   * Returns the index of the first range whose end date matches given one's start date.
   *
   * @param {DateRange[]} ranges
   * @param {DateRange} range
   * @private
   * @returns {number}
   */
  findIndexOfAdjacentRange (ranges, range) {
    return ranges.findIndex(current => {
      return current.end.isSame(range.start);
    });
  }

  /**
   * Sorts availabilities by start date and joins any overlapping or adjacent ones into single availabilities.
   *
   * @private
   */
  normalize () {

    this.sortByStartDate();

    /** @type {DateRange[]} */
    let normalized = [];

    this.availabilities.map(availability => {
      // combine overlapping (includes identical ranges which remain unchanged)
      let indexOverlapping = this.findIndexOfOverlappingRange(normalized, availability);
      if (indexOverlapping > -1) {
        normalized[indexOverlapping] = normalized[indexOverlapping].add(availability);
        return;
      }
      // combine adjacent
      let indexAdjacent = this.findIndexOfAdjacentRange(normalized, availability);
      if (indexAdjacent > -1) {
        normalized[indexAdjacent] = moment.range(normalized[indexAdjacent].start, availability.end);
        return;
      }
      normalized.push(availability);
    });
    this.availabilities = normalized;
  }

  /**
   * Adds an available time range
   *
   * @param {string} startDate ISO 8601 string
   * @param {string} endDate ISO 8601 string
   */
  addAvailability (startDate, endDate) {

    let momentStartUtc = moment(startDate).utc(); // equivalent to new Date(startDate)
    let momentEndUtc = moment(endDate).utc();

    if (momentEndUtc.toDate() <= this.startDate || momentStartUtc.toDate() >= this.endDate) {
      return;
    }
    this.availabilities.push(
      moment.range(momentStartUtc, momentEndUtc)
    );
    this.normalize();
  }


  /**
   * Adds an available time range and repeats it on the given weekdays
   *
   * @param {string} startDate ISO 8601 string
   * @param {string} endDate ISO 8601 string
   * @param {number[]} repeatWeekdays Array of integers that indicate the weekdays on which the availability is repeated. 1 = Mon, 7 = Sun (in the same time zone as startDate).
   */
  addWeeklyRecurringAvailability (startDate, endDate, repeatWeekdays) {

    let momentStartUtc = moment(startDate).utc(); // equivalent to new Date(startDate)
    let momentEndUtc = moment(endDate).utc();

    if (momentEndUtc <= momentStartUtc) {
      return;
    }
    if (momentStartUtc.toDate() >= this.endDate) {
      return;
    }
    this.addAvailability(startDate, endDate);

    if (!Array.isArray(repeatWeekdays)) {
      return;
    }
    repeatWeekdays = repeatWeekdays.filter(weekday => Number.isInteger(weekday) && weekday >= 0 && weekday <= 7);
    if (!repeatWeekdays.length) {
      return;
    }
    let durationInMinutes = moment.range(momentStartUtc, momentEndUtc).diff('minutes');

    /**
     * By default, moment shifts the date to the local computer's timezone (go figure).
     * utcOffset() shifts the date to a given timezone and is able to extract the offset from a full time stamp.
     */
    let momentInTimezone = moment(startDate).utcOffset(startDate);
    let utcWeekdayDifference = momentInTimezone.isoWeekday() - momentStartUtc.isoWeekday();

    let repeatWeekdaysInUtc = repeatWeekdays
      .map(weekday => weekday - utcWeekdayDifference)
      .map(weekday => weekday % 7) // enforces range -6..6
      .map(weekday => weekday < 1 ? weekday + 7 : weekday); // enforces range 1..7

    moment()
      .recur(moment(momentStartUtc.toDate()).utc(), moment(this.endDate).utc())
      .every(repeatWeekdaysInUtc).daysOfWeek()
      .all()
      .map(date => {
        // moment-recur discards of time information. add it back
        return date
          .set('hour', momentStartUtc.get('hour'))
          .set('minute', momentStartUtc.get('minute'))
          .set('second', momentStartUtc.get('second'));
      })
      .map(date => moment.range(date, date.clone().add(durationInMinutes, 'minutes')))
      .filter(range => range.end.toDate() > this.startDate && range.start.toDate() < this.endDate)
      .map(range => this.availabilities.push(range));

    this.normalize();
  }


  /**
   * Removes a time range from any existing availabilities
   *
   * @param {string} startDate ISO 8601 string
   * @param {string} endDate ISO 8601 string
   */
  removeAvailability (startDate, endDate) {

    let range = moment.range(moment(startDate).utc(), moment(endDate).utc());

    /** @type {DateRange[]} */
    let remainders = [];

    this.availabilities.map(availability => {
      remainders.push(...availability.subtract(range));
    });
    this.availabilities = remainders;
  }


  /**
   * Returns all availabilities as an array of {start: date string, end: date string} objects in chronological order
   *
   * @param {String} timezone Accepts just the timezone offset such as "-05:00" as well as a full time stamp that includes the offset (e.g. "2000-01-01T00:00:00-04:00")
   * @returns {Array.<{start: string, end: string}>} An array of objects with ISO 8601 date strings like {start: '2000-01-01T00:00:00Z', end: '2000-01-01T00:30:00Z'}
   */
  getAvailabilities (timezone = '+0000') {
    return this.availabilities.map(availability => {
      return {
        start: availability.start.utcOffset(timezone).format(),
        end: availability.end.utcOffset(timezone).format()
      };
    });
  }


  /**
   * Returns true if the given time range falls within any availability
   *
   * @param {string} startDate ISO 8601 string
   * @param {string} endDate ISO 8601 string
   * @returns {boolean}
   */
  isAvailable (startDate, endDate) {

    let range = moment.range(moment(startDate).utc(), moment(endDate).utc());

    return !!this.availabilities.find(availability => {
      return range.start.within(availability) && range.end.within(availability);
    });
  }
}

module.exports = AvailabilitySchedule;
