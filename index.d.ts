type Availability = {
    /**
     * ISO 8601 string
     */
    start: string
    /**
     * ISO 8601 string
     */
    end: string
}

declare class AvailabilitySchedule {
    constructor(
        /**
         * Start date of the schedule as an ISO 8601 string
         */
        startDate: string,
        /**
         * End date of the schedule as an ISO 8601 string
         */
        endDate: string
    )

    /**
     * @param startDate ISO 8601 string
     * @param endDate ISO 8601 string
     */
    addAvailability(startDate: string, endDate: string): void

    /**
     * Start and end dates may be earlier than the start date passed to the constructor.
     * @param startDate ISO 8601 string
     * @param endDate ISO 8601 string
     * @param repeatWeekdays Array of integers that indicate the weekdays on which the availability is repeated. 1 = Mon, 7 = Sun (in the same time zone as startDate).
     */
    addWeeklyRecurringAvailability(
        startDate: string,
        endDate: string,
        repeatWeekdays: number[]
    ): void

    /**
     * Use this to remove a time range from any existing availabilities.
     * For example, call this for scheduled appointments or meetings.
     * @param startDate ISO 8601 string
     * @param endDate ISO 8601 string
     */
    removeAvailability(startDate: string, endDate: string): void

    /**
     * Returns all availabilities in chronological order.
     * @param timezone Accepts just the timezone offset such as "-05:00" as well as a full time stamp that includes the offset (e.g. "2000-01-01T00:00:00-04:00"). Defaults to '+0000'
     */
    getAvailabilities(timezone?: string): Availability[]

    /**
     * Returns true if the given time range falls within any availability.
     * @param startDate ISO 8601 string
     * @param endDate ISO 8601 string
     */
    isAvailable(startDate: string, endDate: string): boolean
}

declare module 'availability-schedule' {
    export = AvailabilitySchedule
}
