// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  // {
  //   title: 'dashboard',
  //   path: '/dashboard/app',
  //   icon: getIcon('eva:pie-chart-2-fill'),
  // },
  {
    title: 'client',
    path: '/doctor/user',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'procedure',
    path: '/doctor/procedure',
    icon: getIcon('eva:shopping-bag-fill'),
  },
  {
    title: 'timetable',
    path: '/doctor/timetable',
    icon: getIcon('eva:calendar-fill'),
  },
  {
    title: 'note',
    path: '/doctor/note',
    icon: getIcon('material-symbols:note-alt-rounded'),
  },
  {
    title: 'email',
    path: '/doctor/mail',
    icon: getIcon('eva:email-fill'),
  },
];

export default navConfig;
