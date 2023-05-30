
import { getDaysOfWeek } from '../src/date-utils'

require('jest-mock-now')(new Date('2023-04-20'));


describe("Date utils", () => {

    test("Get days of week", () => {

        expect(getDaysOfWeek()).toStrictEqual([
            '2023-04-17',
            '2023-04-18',
            '2023-04-19',
            '2023-04-20',
            '2023-04-21',
            '2023-04-22',
            '2023-04-23',
        ]);

        expect(getDaysOfWeek('2023-05-24')).toStrictEqual([
            '2023-05-22',
            '2023-05-23',
            '2023-05-24',
            '2023-05-25',
            '2023-05-26',
            '2023-05-27',
            '2023-05-28',
        ]);

        expect(getDaysOfWeek('2023-05-28')).toStrictEqual([
            '2023-05-22',
            '2023-05-23',
            '2023-05-24',
            '2023-05-25',
            '2023-05-26',
            '2023-05-27',
            '2023-05-28',
        ]);

        
    });

});


