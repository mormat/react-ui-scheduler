
const getDaysOfWeek = (current?:any): string[] => {

    const today = new Date( current || Date.now() );

    let date  = today.getDate() - today.getDay();

    if (today.getDay() === 0) {
        date -= 7;
    }

    const start   = today.setDate(date + 1);
    const results = [];
    for (let i = 0; i < 7; i++) {
        const timestamp = start + i * 24 * 60 * 60 * 1000;
        results.push(new Date(timestamp).toISOString().substring(0, 10));
    }

    return results;

}

function getHoursBetween(minHour: number, maxHour: number, minutesGap: number = 60): string[] {

    const results: string[] = [];

    let minutes = minHour * 60;
    while (minutes <= maxHour * 60) {
        results.push(
            new String(minutes / 60).padStart(2, '0') + 
            ':' +
            new String(minutes % 60).padStart(2, '0')
        )
        minutes += minutesGap;
    }

    return results;

}

export { getDaysOfWeek, getHoursBetween }