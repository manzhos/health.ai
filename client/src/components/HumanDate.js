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
      {d.getDate()} {MONTH[Number(d.getMonth())]} {d.getFullYear()}<br/>
      {d.getHours()} : {d.getMinutes()}
    </div>
  );
}