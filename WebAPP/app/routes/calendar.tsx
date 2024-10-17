import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CreateEventType, eventSchema } from '~/firebase/schema/events';
import { addEventCollection, getEventsByYearMonth, isEventConflict } from '~/firebase/collection/events';

export default function WebCalendar() {
  const navigate = useNavigate();

  const [addEventBlock, setAddEventBlock] = useState(false);
  const [importCSVBlock, setImportCSVBlock] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [eventsData, setEventsData] = useState<eventSchema[]>();

  const [date, setDate] = useState(new Date());
  const [selectedEvents, setSelectedEvents] = useState<eventSchema[]>([]);
  const [newEvent, setNewEvent] = useState<CreateEventType>({
    userId: '',
    title: '',
    description: '',
    location: '',
    date: date.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' }),
    eventTime: { allDay: false, start: "", end: "" },
    reminder: { enabled: false, time: "", sent: false },
    createdAt: new Date()
  });
  const [csvFile, setCSVFile] = useState<File | null>(null);

  const handleDateChange = async (newDate: Date, userId: string) => {
    const year = newDate.getFullYear().toString();
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');

    if (!eventsData || 
      eventsData[0].date.split('-')[0] !== year || 
      eventsData[0].date.split('-')[1] !== month
    ) {
      const events = await getEventsByYearMonth(userId, year, month);

      setEventsData(events);
      setDate(newDate);
      const selected = events.filter(event => event.date === newDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' }));
      setSelectedEvents(selected);
      return;
    }

    setDate(newDate);
    const selected = eventsData.filter(event => event.date === newDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' }));
    setSelectedEvents(selected);
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New event:', newEvent);

    if (newEvent.title === '') {
      alert('Title is required');
      return;
    }

    if (newEvent.reminder.enabled && newEvent.reminder.time === '') {
      alert('Reminder time is required');
      return;
    }

    if (!newEvent.eventTime.allDay && (newEvent.eventTime.start === '' || newEvent.eventTime.end === '')) {
      alert('Event start and end time is required');
      return;
    }

    const isConflict = await isEventConflict(newEvent.userId, newEvent.date, newEvent.eventTime.start, newEvent.eventTime.end);
    if (isConflict) {
      const res = confirm('Event time conflict. Do you want to proceed?');
      if (!res) {
        return;
      }
    }

    const result = await addEventCollection(newEvent);
    if (!result) {
      throw new Error('Failed to add event');
    }
    setAddEventBlock(false);
    setNewEvent({
      userId: '',
      title: '',
      description: '',
      location: '',
      date: '',
      eventTime: { allDay: false, start: "", end: "" },
      reminder: { enabled: false, time: "", sent: false },
      createdAt: new Date()
    });

    const events = await getEventsByYearMonth(userId!, date.getFullYear().toString(), (date.getMonth() + 1).toString().padStart(2, '0'));
    setEventsData(events);
    handleDateChange(date, userId!);
  };

  const handleCSVImport = async (
    userId: string,
  ) => {
    if (csvFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const csvData = event.target?.result as string;
        const rows = csvData.split('\n');
        const headers = rows[0].split(',');

        const events = rows.slice(1).map((row) => {
          const values = row.split(',');
          const eventObject: Record<string, string> = {};

          headers.forEach((header, index) => {
            eventObject[header] = values[index];
          });

          return {
            userId,
            title: eventObject['title'],
            description: eventObject['description'] || '',
            location: eventObject['location'] || '',
            date: eventObject['date (YYYY-MM-DD)'],
            eventTime: {
              allDay: eventObject['allDay? (T/F)'] === 'T',
              start: eventObject['start (xx:xx)'] || '',
              end: eventObject['end (xx:xx)'] || ''
            },
            reminder: {
              enabled: eventObject['reminder? (T/F)'] === 'T',
              time: eventObject['time (xx:xx)'] || '',
              sent: false
            },
            createdAt: new Date(),
          };
        });

        events.forEach(async (newEvent) => {
          try {
            console.log('New event:', newEvent);
            if (newEvent.title === '') {
              console.log('Skipping empty event');
              return;
            }

            const result = await addEventCollection(newEvent);
            if (!result) {
              throw new Error(`Failed to add event: ${newEvent.title}`);
            }
            console.log(`Event added successfully: ${newEvent.title}`);
          } catch (error) {
            console.error(`Error adding event ${newEvent.title}:`, error);
          }
        });
      };

      reader.readAsText(csvFile);
    } else {
      console.error('No CSV file selected.');
    }
  };

  const handleAllDayToggle = () => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      eventTime: {
        ...prevEvent.eventTime,
        allDay: !prevEvent.eventTime.allDay,
      }
    }));
  };

  const handleReminderToggle = () => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      reminder: {
        ...prevEvent.reminder,
        enabled: !prevEvent.reminder.enabled,
      }
    }));
  };

  useEffect(() => {
    const verifyToken = async () => {
      const res = await fetch('/verifyToken', {
        method: 'POST',
      });
      if (res.status === 401) {
        console.log('Unauthorized');
        navigate('/login');
      }
      const tokenRef = await res.json();
      const userId = tokenRef.uid;

      setUserId(userId);
      handleDateChange(date, userId);
    };

    verifyToken();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-black">Calendar Web App</h1>
      <div className="flex flex-col md:flex-row gap-4 text-black">
        <div className="w-full md:w-1/2">
          <Calendar
            onChange={(value) => handleDateChange(value as Date, userId!)}
            value={date}
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const event = eventsData?.find((event) => event.date === date.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' }));
                if (event) {
                  return 'text-blue-500'
                }
              }
            }}
            className="w-full rounded-lg shadow-md bg-white"
          />
        </div>
        <div className="w-full md:w-1/2">
          <button
            onClick={() => setAddEventBlock(!addEventBlock)}
            className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900"
          >
            {addEventBlock ? 'Close' : 'Add New Event'}
          </button>
          {
            addEventBlock && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Add New Event</h2>
                <form onSubmit={handleAddEventSubmit} className="mb-4">
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value, userId: userId! })}
                    placeholder="Event Title"
                    className="w-full p-2 mb-2 border rounded bg-white"
                    required />
                  <input
                    type="text"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event Description"
                    className="w-full p-2 mb-2 border rounded bg-white" />
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event Location"
                    className="w-full p-2 mb-2 border rounded bg-white" />
                  <label className="flex items-center">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2 mb-2 border rounded bg-white"
                    required />

                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={newEvent.eventTime.allDay}
                      onChange={handleAllDayToggle}
                      className="mr-2 cursor-pointer border rounded bg-white" />
                    All Day?
                  </label>
                  {!newEvent.eventTime.allDay && (
                    <div>
                      <label className="flex items-center">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newEvent.eventTime.start}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          eventTime: { ...newEvent.eventTime, start: e.target.value }
                        })}
                        className="w-full p-2 mb-2 border rounded bg-white" />
                      <label className="flex items-center">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newEvent.eventTime.end}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          eventTime: { ...newEvent.eventTime, end: e.target.value }
                        })}
                        className="w-full p-2 mb-2 border rounded bg-white" />
                    </div>
                  )}

                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={newEvent.reminder.enabled}
                      onChange={handleReminderToggle}
                      className="mr-2 cursor-pointer border rounded bg-white" />
                    Reminder?
                  </label>

                  {newEvent.reminder.enabled && (
                    <div>
                      <input
                        type="time"
                        value={newEvent.reminder.time}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          reminder: { ...newEvent.reminder, time: e.target.value }
                        })}
                        className="w-full p-2 mb-2 border rounded bg-white" />
                    </div>
                  )}

                  <button type="submit" className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900">
                    Add Event
                  </button>
                </form>
              </div>
            )
          }

          <button
            onClick={() => setImportCSVBlock(!importCSVBlock)}
            className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900 mt-6"
          >
            {importCSVBlock ? 'Close' : 'Import from CSV'}
          </button>
          {
            importCSVBlock && (
              <div>
                <h2 className="text-xl font-semibold mb-2 mt-4">Import from CSV</h2>
                <p className="mb-2">Please download the CSV template {' '}
                  <button className='underline'
                    onClick={
                      () => {
                        const rows = [[
                          'title',
                          'description',
                          'location',
                          'date (YYYY-MM-DD)',
                          'allDay? (T/F)',
                          'start (xx:xx)',
                          'end (xx:xx)',
                          'reminder? (T/F)',
                          'time (xx:xx)',
                        ]];
                        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
                        const encodedUri = encodeURI(csvContent);
                        const encodededUri = encodedUri.replaceAll('#', '%23');
                        const link = document.createElement('a');
                        link.setAttribute('href', encodededUri);
                        link.setAttribute('download', 'csv-template.csv');
                        document.body.appendChild(link);
                        link.click();
                      }
                    }
                  >
                    here
                  </button>.
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                  className="mb-2"
                />
                <button
                  onClick={() => handleCSVImport(userId!)}
                  className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900"
                  disabled={!csvFile}
                >
                  Import CSV
                </button>
              </div>
            )
          }
        </div>
      </div>

      <div className="mt-4 text-black">
        <h2 className="text-xl font-semibold mb-2">Events on {date.toDateString()}</h2>
        {selectedEvents.length > 0 ? (
          <ul className="list-disc list-inside">
            {selectedEvents.map((event, index) => (
              <div key={index} className='mb-4'>
                <hr className='mb-2' />
                <li key={index}>
                  <strong>{event.title}</strong>
                  {event.description && <p>{event.description}</p>}
                  {event.location && <p>Location: {event.location}</p>}
                  <p>
                    {event.eventTime.allDay
                      ? "All Day Event"
                      : `From: ${event.eventTime.start} To: ${event.eventTime.end}`}
                  </p>
                  <p>
                    {event.reminder.enabled && (
                        `Reminder: ${event.reminder.time} ${event.reminder.sent ? ' (Sent)' : ' (Pending)'}`
                    )}
                  </p>
                </li>
              </div>
            ))}
          </ul>
        ) : (
          <p>No events for this date.</p>
        )}
      </div>


    </div>
  );
}
