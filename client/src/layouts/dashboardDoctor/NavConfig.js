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
    title: 'user',
    path: '/dashboard/user',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'procedure',
    path: '/dashboard/procedure',
    icon: getIcon('eva:shopping-bag-fill'),
  },
  {
    title: 'timetable',
    path: '/dashboard/timetable',
    icon: getIcon('eva:calendar-fill'),
  },
];

export default navConfig;
