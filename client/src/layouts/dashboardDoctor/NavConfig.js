// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  // {
  //   title: 'dashboard',
  //   path: '/admin/app',
  //   icon: getIcon('eva:pie-chart-2-fill'),
  // },
  {
    title: 'Client',
    path: '/doctor/client',
    icon: getIcon('eva:people-fill'),
  },
  // {
  //   title: 'procedure',
  //   path: '/admin/procedure',
  //   icon: getIcon('eva:shopping-bag-fill'),
  // },
  // {
  //   title: 'communication',
  //   path: '/admin/communication',
  //   // icon: getIcon('eva:email-outline'),
  //   icon: getIcon('eva:email-fill'),
  // },
  {
    title: 'timetable',
    path: '/doctor/timetable',
    icon: getIcon('eva:calendar-fill'),
  },
];

export default navConfig;
