
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

export { getDaysOfWeek }