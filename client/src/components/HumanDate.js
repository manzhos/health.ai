import React from "react";

export default function humanDate (d) {
  if(!d) return;

  const MONTH = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  
  d = new Date(d)
  return (
    <div>
      {d.getDate()} {MONTH[Number(d.getMonth())]} {d.getFullYear()} / {d.getHours()}:{d.getMinutes() === 0 ? '00' : (String(d.getMinutes()).length === 1 ? '0' + d.getMinutes() : d.getMinutes())}
    </div>
  );
}