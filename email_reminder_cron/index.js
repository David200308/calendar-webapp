const admin = require('firebase-admin');
const cron = require('node-cron');
require('dotenv').config()

admin.initializeApp({
    // need to replace
    credential: admin.credential.cert(require('/root/email_reminder_cron/firebase_key.json')),
});

const db = admin.firestore();

async function getUpcomingReminders() {
    const now = new Date();
    console.log(now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0'));
    console.log(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));

    const eventsRef = db.collection('events');
    try {
        const query = eventsRef
            .where('date', '==', now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0'))
            .where('reminder.enabled', '==', true)
            .where('reminder.sent', '==', false)
            .where('reminder.time', '>=', now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'))
            .where('reminder.time', '<', now.getHours().toString().padStart(2, '0') + ':' + (now.getMinutes() + 1).toString().padStart(2, '0'));

        const snapshot = await query.get();
        console.log('Found', snapshot.docs.length, 'upcoming reminders');
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(error);
    }
}

async function getUser(userId) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        return userDoc.data();
    } catch (error) {
        console.error(error);
    }
}

async function sendEmail(to, subject, body) {
    console.log('Sending email to', to);

    // need to replace
    const domain = 'noreply.calendar.domain';
    const apiEndpoint = `https://api.mailgun.net/v3/${domain}/messages`;

    const reqHeaders = new Headers();
    reqHeaders.append('Authorization', 
        `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
    );

    const formdata = new FormData();
    // need to replace
    formdata.append("from", "Calendar <postmaster@noreply.calendar.domain>");
    formdata.append("to", to);
    formdata.append("subject", subject);
    formdata.append("text", subject);
    formdata.append("html", body);

    const requestOptions = {
        method: 'POST',
        headers: reqHeaders,
        body: formdata,
    };

    try {
        const response = await fetch(apiEndpoint, requestOptions);
        const result = await response.text();
        if (result) return true;
        return false;
    } catch (error) {
        console.error(error);
        return false;
    };
}

async function updateEventReminder(eventId) {
    const eventRef = db.collection('events').doc(eventId);
    await eventRef.update({
        'reminder.sent': true,
    });
}

async function sendReminders() {
    const events = await getUpcomingReminders();
    console.log(events);
    
    for (const event of events) {
        const { userId, title, description } = event;
        const userData = await getUser(userId);
        if (!userData) {
            console.error(`User not found: ${userId}`);
            continue;
        }
        const email = userData.email;
        
        const emailBody = `
            You have an upcoming event: \n
            Title: ${title} \n
            Description: ${description || 'No description provided'} \n
            Date: ${event.date} \n
            Time: ${event.eventTime.allDay ? "All Day" : event.eventTime.start + " - " + event.eventTime.end } \n
        `;
        
        await sendEmail(email, `Reminder: ${title}`, emailBody);
        await updateEventReminder(event.id);
    }
}

cron.schedule('* * * * *', async () => {
    console.log('start reminder check...');
    await sendReminders();
});
