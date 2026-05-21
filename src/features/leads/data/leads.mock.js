export const kpiStats = [
  { id: 'total',        label: 'Total Applications', display: '12,493', trend: 12.5, up: true  },
  { id: 'initiated',    label: 'Initiated',           display:  '3,241', trend:  4.2, up: true  },
  { id: 'qualified',    label: 'Qualified',           display:  '5,832', trend:  8.1, up: true  },
  { id: 'disqualified', label: 'Disqualified',        display:  '1,204', trend:  2.4, up: false },
  { id: 'processed',    label: 'Processed',           display:  '1,890', trend: 15.3, up: true  },
  { id: 'rejected',     label: 'Rejected',            display:    '326', trend:  0.0, up: null  },
];

export const leadStatusOptions = [
  { value: 'all',          label: 'All Statuses' },
  { value: 'Initiated',    label: 'Initiated'    },
  { value: 'Qualified',    label: 'Qualified'    },
  { value: 'Processed',    label: 'Processed'    },
  { value: 'Disqualified', label: 'Disqualified' },
  { value: 'Rejected',     label: 'Rejected'     },
];

export const leadRows = [
  { id: '#LD-9825', location: 'New York, US',  phone: '+1 (555) 123-4567',  calledPhone: '+1 (800) 999-0000',  source: 'Organic Search',  status: 'Initiated',    callStartTime: 'Today, 10:42 AM',      callDuration: '4m 12s',  applicationSubmitted: false, owner: 'me'         },
  { id: '#LD-9824', location: 'London, UK',    phone: '+44 20 7123 4567',   calledPhone: '+44 800 111 2222',   source: 'Paid Social',     status: 'Qualified',    callStartTime: 'Today, 08:15 AM',      callDuration: '12m 45s', applicationSubmitted: true,  owner: 'other'      },
  { id: '#LD-9823', location: 'Sydney, AU',    phone: '+61 2 9876 5432',    calledPhone: '+61 1800 000 000',   source: 'Referral',        status: 'Processed',    callStartTime: 'Yesterday, 16:30 PM',  callDuration: '8m 20s',  applicationSubmitted: false, owner: 'other'      },
  { id: '#LD-9822', location: 'Chicago, US',   phone: '+1 (555) 222-3333',  calledPhone: '+1 (800) 999-0000',  source: 'Direct Traffic',  status: 'Disqualified', callStartTime: 'Yesterday, 14:20 PM',  callDuration: '1m 15s',  applicationSubmitted: false, owner: 'me'         },
  { id: '#LD-9821', location: 'Toronto, CA',   phone: '+1 (416) 555-0198',  calledPhone: '+1 (800) 999-0000',  source: 'Email Campaign',  status: 'Rejected',     callStartTime: 'Yesterday, 11:05 AM',  callDuration: '3m 45s',  applicationSubmitted: false, owner: 'me'         },
  { id: '#LD-9820', location: 'Miami, US',     phone: '+1 (305) 555-7890',  calledPhone: '+1 (800) 999-0000',  source: 'API Integration', status: 'Initiated',    callStartTime: 'Yesterday, 09:30 AM',  callDuration: 'Missed',  applicationSubmitted: false, owner: 'unassigned' },
  { id: '#LD-9819', location: 'Paris, FR',     phone: '+33 1 4200 1234',    calledPhone: '+33 800 000 000',    source: 'Organic Search',  status: 'Qualified',    callStartTime: 'May 18, 03:20 PM',     callDuration: '6m 10s',  applicationSubmitted: false, owner: 'other'      },
  { id: '#LD-9818', location: 'Dubai, AE',     phone: '+971 4 567 8901',    calledPhone: '+971 800 000 000',   source: 'Referral',        status: 'Initiated',    callStartTime: 'May 18, 11:45 AM',     callDuration: '2m 55s',  applicationSubmitted: false, owner: 'unassigned' },
  { id: '#LD-9817', location: 'Seoul, KR',     phone: '+82 2 1234 5678',    calledPhone: '+82 800 000 000',    source: 'Paid Social',     status: 'Processed',    callStartTime: 'May 17, 04:10 PM',     callDuration: '9m 40s',  applicationSubmitted: true,  owner: 'other'      },
  { id: '#LD-9816', location: 'Berlin, DE',    phone: '+49 30 1234 5678',   calledPhone: '+49 800 000 0000',   source: 'Direct Traffic',  status: 'Qualified',    callStartTime: 'May 17, 10:30 AM',     callDuration: '5m 20s',  applicationSubmitted: false, owner: 'me'         },
  { id: '#LD-9815', location: 'Tokyo, JP',     phone: '+81 3 1234 5678',    calledPhone: '+81 800 000 0000',   source: 'Email Campaign',  status: 'Initiated',    callStartTime: 'May 16, 02:15 PM',     callDuration: '3m 30s',  applicationSubmitted: false, owner: 'unassigned' },
  { id: '#LD-9814', location: 'Mumbai, IN',    phone: '+91 22 1234 5678',   calledPhone: '+91 1800 000 000',   source: 'API Integration', status: 'Disqualified', callStartTime: 'May 16, 09:00 AM',     callDuration: '1m 50s',  applicationSubmitted: false, owner: 'other'      },
  { id: '#LD-9813', location: 'Lagos, NG',     phone: '+234 1 234 5678',    calledPhone: '+234 800 000 000',   source: 'Referral',        status: 'Qualified',    callStartTime: 'May 10, 11:30 AM',     callDuration: '5m 00s',  applicationSubmitted: false, owner: 'me'         },
  { id: '#LD-9812', location: 'Cairo, EG',     phone: '+20 2 1234 5678',    calledPhone: '+20 800 000 000',    source: 'Organic Search',  status: 'Rejected',     callStartTime: 'May 08, 09:15 AM',     callDuration: '2m 10s',  applicationSubmitted: false, owner: 'other'      },
  { id: '#LD-9811', location: 'Nairobi, KE',   phone: '+254 20 123 4567',   calledPhone: '+254 800 000 000',   source: 'Direct Traffic',  status: 'Initiated',    callStartTime: 'Apr 28, 03:45 PM',     callDuration: '4m 55s',  applicationSubmitted: false, owner: 'unassigned' },
  { id: '#LD-9810', location: 'Lima, PE',      phone: '+51 1 234 5678',     calledPhone: '+51 800 000 000',    source: 'Email Campaign',  status: 'Processed',    callStartTime: 'Apr 22, 10:00 AM',     callDuration: '7m 30s',  applicationSubmitted: true,  owner: 'me'         },
];
