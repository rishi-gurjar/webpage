import { sheets } from '../config';

async function getSleepTime(): Promise<string[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.V9_SHEET_ID,
            range: 'B2:B',
        });

        const values = response.data.values;
        return values?.flat() || [];
    } catch (error: any) {
        // More detailed error logging
        console.error('Error fetching subscriber list:', {
            message: error.message,
            status: error.status,
            errors: error.errors,
            spreadsheetId: process.env.V9_SHEET_ID
        });
        throw new Error(`Failed to fetch sleep time data: ${error.message}`);
    }
}

async function getWakeTime(): Promise<string[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.V9_SHEET_ID,
            range: 'C2:C',
        });

        const values = response.data.values;
        return values?.flat() || [];
    } catch (error: any) {
        // More detailed error logging
        console.error('Error fetching subscriber list:', {
            message: error.message,
            status: error.status,
            errors: error.errors,
            spreadsheetId: process.env.V9_SHEET_ID
        });
        throw new Error(`Failed to fetch sleep time data: ${error.message}`);
    }
}

async function getTotalSleepTime(): Promise<{ date: string, sleep: string }[]> {
    try {
        const [dateResponse, sleepResponse] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID,
                range: 'A2:A',
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID, 
                range: 'D2:D',
            })
        ]);

        const dates = dateResponse.data.values?.flat() || [];
        const sleepTimes = sleepResponse.data.values?.flat() || [];
        
        return dates.map((date: string, index: number) => ({
            date: date,
            sleep: sleepTimes[index]
        }));

        
    } catch (error: any) {
        // More detailed error logging
        console.error('Error fetching sleep data:', {
            message: error.message,
            status: error.status, 
            errors: error.errors,
            spreadsheetId: process.env.V9_SHEET_ID
        });
        throw new Error(`Failed to fetch sleep time data: ${error.message}`);
    }
}

async function getMentalPhysCheck(): Promise<{ date: string, mental: any, physical: any }[]> {
    try {
        const [dateResponse, mentalResponse, physicalResponse] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID,
                range: 'A2:A',
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID, 
                range: 'N2:N',
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID, 
                range: 'O2:O',
            })
        ]);

        const dates = dateResponse.data.values?.flat() || [];
        const mental = mentalResponse.data.values?.flat() || [];
        const physical = physicalResponse.data.values?.flat() || [];
        
        return dates
            .map((date: string, index: number) => {
                if (!mental[index]) return null;
                return {
                    date: date,
                    mental: mental[index],
                    physical: physical[index]
                };
            })
            .filter((entry): entry is { date: string, mental: any, physical: any } => entry !== null);

        
    } catch (error: any) {
        // More detailed error logging
        console.error('Error fetching sleep data:', {
            message: error.message,
            status: error.status, 
            errors: error.errors,
            spreadsheetId: process.env.V9_SHEET_ID
        });
        throw new Error(`Failed to fetch sleep time data: ${error.message}`);
    }
}

async function getWorkouts(): Promise<{ date: string, inside: any, outside: any }[]> {
    try {
        const [dateResponse, insideResponse, outsideResponse] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID,
                range: 'A2:A',
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID, 
                range: 'E2:E',
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.V9_SHEET_ID, 
                range: 'G2:G',
            })
        ]);

        const dates = dateResponse.data.values?.flat() || [];
        const inside = insideResponse.data.values?.flat() || [];
        const outside = outsideResponse.data.values?.flat() || [];
        return dates
            .map((date: string, index: number) => {
                return {
                    date: date,
                    inside: inside[index] === "TRUE" ? 1 : -1,
                    outside: outside[index] === "TRUE" ? 1 : -1
                };
            })

        
    } catch (error: any) {
        // More detailed error logging
        console.error('Error fetching sleep data:', {
            message: error.message,
            status: error.status, 
            errors: error.errors,
            spreadsheetId: process.env.V9_SHEET_ID
        });
        throw new Error(`Failed to fetch sleep time data: ${error.message}`);
    }
}

async function getInsideWorkout(): Promise<string[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.V9_SHEET_ID,
            range: 'E2:E',
        });

        const values = response.data.values;
        return values?.flat() || [];
    } catch (error: any) {
        // More detailed error logging
        console.error('Error fetching subscriber list:', {
            message: error.message,
            status: error.status,
            errors: error.errors,
            spreadsheetId: process.env.V9_SHEET_ID
        });
        throw new Error(`Failed to fetch sleep time data: ${error.message}`);
    }
}

async function getDateUnformatted(): Promise<string[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.V9_SHEET_ID,
            range: 'A2:A',
        });

        const values = response.data.values;
        return values?.flat() || [];
    } catch (error: any) {
        // More detailed error logging
        console.error('Error fetching subscriber list:', {
            message: error.message,
            status: error.status,
            errors: error.errors,
            spreadsheetId: process.env.V9_SHEET_ID
        });
        throw new Error(`Failed to fetch sleep time data: ${error.message}`);
    }
}

async function setSleepHours(hours: number, index: number) {
    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.V9_SHEET_ID,
        range: `D${index + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[hours]],
        },
    });
}
async function computeTotalSleep() {
    try {
        const [sleepTimeData, wakeTimeData, dateUnformattedData, insideWorkoutData] = await Promise.all([
            getSleepTime(),
            getWakeTime(),
            getDateUnformatted(),
            getInsideWorkout()
        ]);

        // console.log("insideWorkoutData", insideWorkoutData)

        const months = new Map();
        months.set(0, "Jan");
        months.set(1, "Feb");
        months.set(2, "Mar");
        months.set(3, "Apr");
        months.set(4, "May");
        months.set(5, "Jun");
        months.set(6, "Jul");
        months.set(7, "Aug");
        months.set(8, "Sep");
        months.set(9, "Oct");
        months.set(10, "Nov");
        months.set(11, "Dec");


        for (let i = 0; i < sleepTimeData.length; i++) {
            const asleep_raw: string = sleepTimeData[i]
            const awake_raw: string = wakeTimeData[i]
            const date_raw: string = dateUnformattedData[i]
            const [month, day, year] = date_raw.split('/').map(Number)

            const date_post_str = new Date(year, month - 1, day).toDateString();
            const date_post = new Date(year, month - 1, day)
            const date_pre = new Date(date_post.setDate(date_post.getDate() - 1)).toDateString();

            var asleep = new Date()
            if (asleep_raw.includes("PM")) {
                const [hours, minutes] = asleep_raw.replace(/^([^:]+:[^:]+):.*/, '$1').split(':');
                var hours_num = Number(hours)
                if (hours_num != 12) {
                    hours_num = 12 + Number(hours)
                }
                const asleep_cleaned = `${hours_num}:${minutes}`
                const asleep_str: string = `${date_pre} ${asleep_cleaned}:00`
                asleep = new Date(asleep_str)
            } else {
                const [hours, minutes] = asleep_raw.replace(/^([^:]+:[^:]+):.*/, '$1').split(':');
                var hours_num = Number(hours)
                if (hours_num == 12) {
                    hours_num = 0
                }
                const asleep_cleaned = `${hours_num}:${minutes}`
                const asleep_str: string = `${date_post_str} ${asleep_cleaned}:00`
                asleep = new Date(asleep_str)
            }

            var awake = new Date()
            if (awake_raw.includes("AM")) {
                const awake_cleaned: string = awake_raw.replace(/^([^:]+:[^:]+):.*/, '$1');
                const awake_str: string = `${date_post_str} ${awake_cleaned}:00`
                awake = new Date(awake_str)
            }

            const millis: number = awake.getTime() - asleep.getTime()
            const hours: number = millis / (1000 * 60 * 60)
            await setSleepHours(hours, i)

        }
        console.log("Sleep hours updated")

        return {
            sleepTimes: sleepTimeData,
            wakeTimes: wakeTimeData,
            dates: dateUnformattedData
        };
    } catch (error) {
        console.error("Error computing total sleep:", error);
        throw error;
    }
}
export { 
    computeTotalSleep, 
    getTotalSleepTime, 
    getMentalPhysCheck, 
    getWorkouts 
};

