// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/admin/app',
    icon: getIcon('eva:pie-chart-2-fill'),
  },
  {
    title: 'staff',
    path: '/admin/staff',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'leads',
    path: '/admin/lead',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'clients',
    path: '/admin/client',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'partners',
    path: '/admin/partner',
    icon: getIcon('eva:people-fill'),
  },
  // {
  //   title: 'user',
  //   path: '/admin/user',
  //   icon: getIcon('eva:people-fill'),
  // },
  {
    title: 'procedures',
    path: '/admin/procedure',
    icon: getIcon('eva:shopping-bag-fill'),
  },
  {
    title: 'mailing',
    path: '/admin/mailing',
    icon: getIcon('eva:email-fill'),
  },
  {
    title: 'communication',
    path: '/admin/communication',
    icon: getIcon('ic:round-message'),
  },
  {
    title: 'timetable',
    path: '/admin/timetable',
    icon: getIcon('eva:calendar-fill'),
  },
  {
    title: 'invoices',
    path: '/admin/invoices',
    icon: getIcon('fa6-solid:file-invoice'),
  },
  // {
  //   title: 'blog',
  //   path: '/dashboard/blog',
  //   icon: getIcon('eva:file-text-fill'),
  // },
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: getIcon('eva:lock-fill'),
  // },
  // {
  //   title: 'register',
  //   path: '/register',
  //   icon: getIcon('eva:person-add-fill'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: getIcon('eva:alert-triangle-fill'),
  // },
];

export default navConfig;
