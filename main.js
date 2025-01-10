import fetch from "node-fetch";
import fs from 'fs/promises';

const ZIP_CODES = [77001, 77002, 77003, 77004, 77005];
const DAYS = 14;

const rootURL = 'https://tools.usps.com/UspsToolsRestServices/rest/v2';
const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'content-type': 'application/json;charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
};

const checkedLocations = new Set();

// Utility function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function fetchWithRetry(url, options, retries = 3, baseDelay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            const text = await response.text(); // Get response as text first
            try {
                return JSON.parse(text); // Try to parse as JSON
            } catch (e) {
                console.error('Received non-JSON response:', text.substring(0, 100) + '...');
                throw new Error('Invalid JSON response');
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            const waitTime = baseDelay * Math.pow(2, i); // Exponential backoff
            console.warn(`Attempt ${i + 1} failed, retrying in ${waitTime}ms...`);
            await delay(waitTime);
        }
    }
}

function formatDate(d) {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const year = d.getFullYear();
    return `${year}${month < 10 ? '0' : ''}${month}${day < 10 ? '0' : ''}${day}`;
}

function getDates() {
    let res = [];
    let next = new Date();
    next.setDate(next.getDate() + 1);
    for (let i = 0; i < DAYS; i++) {
        const date = formatDate(next);
        next.setDate(next.getDate() + 1);
        res.push(date);
    }
    return res;
}

async function getLocations(zip) {
    const resp = await fetchWithRetry(`${rootURL}/facilityScheduleSearch`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "poScheduleType": "PASSPORT",
            "date": formatDate(new Date()),
            "numberOfAdults": "1",
            "numberOfMinors": "0",
            "radius": "20",
            "zip5": zip,
            "city": "",
            "state": ""
        })
    });
    
    if (!resp.facilityDetails) {
        console.warn(`No facility details found for zip ${zip}`);
        return [];
    }
    
    return resp.facilityDetails
        .filter(item => !checkedLocations.has(item.fdbId))
        .map(item => ({fdbId: item.fdbId, name: item.name}));
}

async function getAppointments(date, fdbIds) {
    const appointments = await fetchWithRetry(`${rootURL}/appointmentTimeSearch`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            "date": date,
            "productType": "PASSPORT",
            "numberOfAdults": "1",
            "numberOfMinors": "0",
            "excludedConfirmationNumber": [""],
            "fdbId": fdbIds,
            "skipEndOfDayRecord": true,
        })
    });
    
    if (!appointments.appointmentTimeDetailExtended) {
        console.warn(`No appointment details found for date ${date}`);
        return [];
    }
    
    return appointments.appointmentTimeDetailExtended.filter(
        appt => appt.appointmentStatus != 'Unavailable' &&
        appt.appointmentStatus != 'Closed' &&
        appt.appointmentStatus != 'Holiday' &&
        appt.appointmentStatus != 'Past');
}

async function writeAppointmentsToFile(appointments, location, date, zip) {
    const appointmentData = {
        zip,
        location,
        date,
        appointments
    };
    
    await fs.appendFile(
        'appointments.json', 
        JSON.stringify(appointmentData) + '\n',
        'utf8'
    );
}

async function processZip(zip) {
    try {
        console.info(`Processing zip code ${zip}...`);
        const locations = await getLocations(zip);
        console.info(`Found ${locations?.length} new locations for zip ${zip}`);
        
        const dates = getDates();
        for (let location of locations) {
            if (!checkedLocations.has(location.fdbId)) {
                checkedLocations.add(location.fdbId);
                for (let date of dates) {
                    try {
                        console.info(`Checking appointments for ${date} at ${location.name}`);
                        const appointments = await getAppointments(date, [location.fdbId]);
                        
                        if (appointments?.length > 0) {
                            console.info(`Found ${appointments.length} appointments!`);
                            await writeAppointmentsToFile(appointments, location, date, zip);
                        }
                        
                        // Add a small delay between requests to avoid overwhelming the server
                        await delay(500);
                    } catch (error) {
                        console.error(`Error checking appointments for ${date} at ${location.name}:`, error);
                        continue; // Continue with next date even if this one fails
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error processing zip ${zip}:`, error);
    }
}

async function processBatch(zipCodes) {
    return Promise.all(zipCodes.map(zip => processZip(zip)));
}

async function main() {    
    // Create appointments.json if it doesn't exist
    try {
        await fs.access('appointments.json');
    } catch {
        await fs.writeFile('appointments.json', '', 'utf8');
    }
    
    for (let i = 0; i < ZIP_CODES.length; i += 10) {
        const batch = ZIP_CODES.slice(i, i + 10);
        console.info(`Processing batch of ${batch.length} zip codes...`);
        await processBatch(batch);
        console.info(`Completed batch. Processed ${i + batch.length} of ${ZIP_CODES.length} zip codes`);
        
        // Add a delay between batches
        if (i + 10 < ZIP_CODES.length) {
            console.info('Waiting between batches...');
            await delay(2000);
        }
    }
    
    console.info('All zip codes processed. Check appointments.json for results.');
}

main().catch(console.error);