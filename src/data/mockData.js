// Mock data for Mission Control Dashboard — UI only, no backend

export const todaySchedule = [
  { time: '08:00', title: 'Morning standup', type: 'work', duration: 15 },
  { time: '09:30', title: 'CS 301 — Algorithms', type: 'school', duration: 90 },
  { time: '12:00', title: 'Lunch break', type: 'personal', duration: 45 },
  { time: '14:00', title: 'Project sync', type: 'work', duration: 60 },
  { time: '16:30', title: 'Study block — Math', type: 'school', duration: 90 },
  { time: '19:00', title: 'Gym', type: 'personal', duration: 60 },
];

export const schoolData = {
  assignments: [
    { name: 'Algorithms HW4 — Dynamic Programming', due: 'Mar 8', progress: 60, course: 'CS 301' },
    { name: 'Linear Algebra Problem Set 5', due: 'Mar 10', progress: 30, course: 'MATH 202' },
    { name: 'Research paper draft', due: 'Mar 15', progress: 20, course: 'ENG 400' },
  ],
  classes: [
    { name: 'CS 301 — Algorithms', time: 'MWF 9:30', room: 'Hall 204' },
    { name: 'MATH 202 — Linear Algebra', time: 'TTh 11:00', room: 'Sci 101' },
    { name: 'ENG 400 — Research Writing', time: 'W 14:00', room: 'Lib 302' },
  ],
  studySuggestions: ['Review DP problems (2h)', 'LA eigenvectors (1h)', 'Paper outline (30m)'],
};

export const workData = {
  shifts: [
    { day: 'Today', time: '18:00 – 22:00', role: 'Support' },
    { day: 'Fri', time: '14:00 – 20:00', role: 'Support' },
    { day: 'Sat', time: '10:00 – 18:00', role: 'Lead' },
  ],
  hoursThisWeek: 24,
  estimatedIncome: 384,
};

export const projectsData = [
  { name: 'Portfolio site', progress: 75, tasksLeft: 3, lastActivity: '2h ago', color: 'blue' },
  { name: 'Capstone MVP', progress: 40, tasksLeft: 12, lastActivity: '1d ago', color: 'violet' },
  { name: 'API integration', progress: 90, tasksLeft: 1, lastActivity: '5h ago', color: 'emerald' },
  { name: 'Design system', progress: 25, tasksLeft: 8, lastActivity: '3d ago', color: 'amber' },
];

export const tasksData = {
  today: [
    { id: 1, title: 'Submit algorithms HW4', done: false },
    { id: 2, title: 'Review PR #42', done: true },
    { id: 3, title: 'Grocery run', done: false },
    { id: 4, title: 'Call dentist', done: false },
  ],
  upcoming: [
    { id: 5, title: 'Prepare for midterm', due: 'Mar 12' },
    { id: 6, title: 'Team retrospective', due: 'Mar 14' },
  ],
  overdue: [
    { id: 7, title: 'Update resume', overdue: '2 days' },
  ],
};

export const calendarWeekEvents = [
  { day: 'Mon', date: 3, events: 2 },
  { day: 'Tue', date: 4, events: 1 },
  { day: 'Wed', date: 5, events: 4 },
  { day: 'Thu', date: 6, events: 2 },
  { day: 'Fri', date: 7, events: 3 },
  { day: 'Sat', date: 8, events: 0 },
  { day: 'Sun', date: 9, events: 1 },
];

export const financeSnapshot = {
  monthlySpending: 1240,
  monthlyIncome: 2100,
  upcomingBills: [
    { name: 'Rent', amount: 850, due: 'Mar 10' },
    { name: 'Utilities', amount: 95, due: 'Mar 12' },
  ],
};

export const aiPlannerSuggestions = {
  dailySchedule: [
    '08:00 – Focus block (deep work)',
    '09:30 – CS 301 lecture',
    '12:00 – Break + lunch',
    '14:00 – Project sync',
    '16:30 – Study: Algorithms (2h)',
  ],
  studyRec: 'Prioritize DP problems today — exam in 1 week.',
  focusBlocks: '2 recommended: 08:00 (90m), 16:30 (2h)',
};

export const rightPanelData = {
  quickNote: 'Meeting notes: deploy by EOW...',
  recentActivity: [
    { action: 'Completed task', item: 'Review PR #42', time: '1h ago' },
    { action: 'Added event', item: 'Dentist', time: '2h ago' },
    { action: 'Updated project', item: 'Portfolio site', time: '3h ago' },
  ],
  quickTasks: ['New task...'],
};

// School page — assignments as cards
export const schoolAssignmentsPage = [
  { title: 'Algorithms HW4', course: 'CS 301', due: 'Mar 8, 11:59 PM', progress: 60, priority: 'high' },
  { title: 'LA Problem Set 5', course: 'MATH 202', due: 'Mar 10', progress: 30, priority: 'medium' },
  { title: 'Research paper draft', course: 'ENG 400', due: 'Mar 15', progress: 20, priority: 'medium' },
  { title: 'Lab report 3', course: 'PHY 101', due: 'Mar 18', progress: 0, priority: 'low' },
];

// Projects page — kanban columns
export const kanbanColumns = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: 't1', title: 'Design hero section', project: 'Portfolio' },
      { id: 't2', title: 'Set up staging env', project: 'Capstone' },
    ],
  },
  {
    id: 'progress',
    title: 'In Progress',
    tasks: [
      { id: 't3', title: 'Implement auth flow', project: 'Capstone' },
      { id: 't4', title: 'Write API docs', project: 'API integration' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 't5', title: 'Landing page layout', project: 'Portfolio' },
    ],
  },
];

// Calendar page — sample events by category
export const calendarPageEvents = [
  { id: 1, title: 'CS 301 Lecture', start: '09:30', end: '11:00', category: 'school', day: 5 },
  { id: 2, title: 'Project sync', start: '14:00', end: '15:00', category: 'work', day: 5 },
  { id: 3, title: 'Study block', start: '16:30', end: '18:00', category: 'school', day: 5 },
  { id: 4, title: 'Team standup', start: '09:00', end: '09:30', category: 'work', day: 6 },
  { id: 5, title: 'Dentist', start: '11:00', end: '11:30', category: 'personal', day: 6 },
];
