
const fetch = require('node-fetch');

async function test() {
    const id = 60; // One of the IDs from the DB
    const url = `http://localhost:3000/api/recipes/${id}`;
    console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}

test();
