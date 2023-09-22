import React, { useEffect, useState } from 'react';

function Try() {
    const [events, setEvents] = useState<string[]>([]);

    // useEffect(() => {
    //     const eventSource = new EventSource('http://127.0.0.1:5000/try');

    //     eventSource.onmessage = (event) => {
    //         setEvents((prevEvents) => [...prevEvents, event.data]);
    //     };

    //     eventSource.onerror = (error) => {
    //         console.error('SSE Error:', error);
    //         eventSource.close();
    //     };

    //     return () => {
    //         eventSource.close();
    //     };
    // }, []);

    return (
        <div>
            <h1>Streaming Events from Flask</h1>
            <ul>
                {events.map((event, index) => (
                    <li key={index}>{event}</li>
                ))}
            </ul>
        </div>
    );
}

export default Try;
