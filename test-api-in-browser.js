// Quick test to check the API response
// Open browser console and paste this:

fetch('http://localhost:3000/api/family/my-family', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    }
})
.then(r => r.json())
.then(data => {
    console.log('=== FULL API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n=== DATA OBJECT ===');
    console.log('Has family property?', 'family' in (data.data || {}));
    console.log('Data keys:', Object.keys(data.data || {}));
    if (data.data && data.data.family) {
        console.log('\n=== FAMILY OBJECT ===');
        console.log(JSON.stringify(data.data.family, null, 2));
    } else {
        console.log('\n❌ NO FAMILY PROPERTY IN DATA');
        console.log('Full data object:', data.data);
    }
});
