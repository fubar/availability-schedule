'use strict';

const moment = require('moment');
const DateRange = require('moment-range'); // eslint-disable-line no-unused-vars

/**
 * @class AvailabilitySchedule
 * @author Philipp Gebauer https://github.com/fubar
 *
 * A simple availability schedule library
 *
 * See the readme for usage details.
 */
class AvailabilitySchedule {

  /** @member {DateRange[]} AvailabilitySchedule#availabilities */

  constructor () {
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
   * @param {Date} date
   * @param {number} duration in minutes
   */
  addAvailability (date, duration) {
    this.availabilities.push(
      moment.range(
        moment(date),
        moment(date).add(duration, 'minutes')
      )
    );
    this.normalize();
  }


  // todo addRecurringAvailability(RecurringAvailability): same as above, but for each recurrence


  /**
   * Removes a time range from any existing availabilities
   *
   * @param {Date} date
   * @param {number} duration in minutes
   */
  removeAvailability (date, duration) {

    var range = moment.range(
      moment(date),
      moment(date).add(duration, 'minutes')
    );

    /** @type {DateRange[]} */
    let remainders = [];

    this.availabilities.map(availability => {
      remainders.push(...availability.subtract(range));
    });
    this.availabilities = remainders;
  }


  /**
   * Returns all availabilities as tuples of Dates [start, end] in chronological order.
   *
   * todo limit length of returned schedule
   * @returns {Array.<String>} An array of Date tuples like [Date(2000-01-01T00:00:00.000Z), Date(2000-01-01T00:30:00.000Z)]
   */
  getAvailabilities () {
    return this.availabilities.map(availability => {
      return availability.toDate();
    });
  }


  /**
   * Returns true if the given time range falls within any availability.
   *
   * @param {Date} date
   * @param {number} duration in minutes
   * @returns {boolean}
   */
  isAvailable (date, duration) {

    var range = moment.range(
      moment(date),
      moment(date).add(duration, 'minutes')
    );

    return !!this.availabilities.find(availability => {
      return range.start.within(availability) && range.end.within(availability);
    });
  }
}

module.exports = AvailabilitySchedule;
