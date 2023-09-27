import React, { useEffect, useState } from 'react';

function Try() {
    function parseCustomTimestamp(timestampString : string) {
        const match = timestampString.match(/(\d+)\.(\d+)\.(\d+) (\d+):(\d+):(\d+),(\d+)/);
        if (!match) {
          return null; // Invalid timestamp format
        }
      
        const [, day, month, year, hours, minutes, seconds, milliseconds] = match.map(Number);
      
        if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year) ||
            Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds) ||
            Number.isNaN(milliseconds)) {
          return null; // Invalid numeric values
        }
      
        // Create a Date object with extracted components
        return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
      }
      
      // Usage example:
      const customTimestampString = "31.07.2023 10:38:21,734760";
      const customTimestamp = parseCustomTimestamp(customTimestampString);
      
      if (customTimestamp) {
        console.log(customTimestamp); // Should display the parsed Date object
      } else {
        console.error("Invalid timestamp format");
      }
      return <div>Time</div>
      
}

export default Try;
