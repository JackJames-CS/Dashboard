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
    { name: 'CS211', label: 'L1 Lecture', day: 'Mon', time: '09:00–10:00', room: 'JHL1' },
    { name: 'CS335', label: 'L1 Lecture', day: 'Mon', time: '12:00–13:00', room: 'ARTSALT' },
    { name: 'CS211', label: 'L2 Lecture', day: 'Mon', time: '14:00–15:00', room: 'JHL1' },
    { name: 'CS335', label: 'L2 Lecture', day: 'Mon', time: '17:00–18:00', room: 'TSILT3' },
    { name: 'CS211', label: 'Labs',       day: 'Tue', time: '09:00–11:00', room: '' },
    { name: 'CS230', label: 'Labs',       day: 'Tue', time: '11:00–13:00', room: '' },
    { name: 'CS230', label: 'L1 Lecture', day: 'Tue', time: '13:00–14:00', room: 'TSILT3' },
    { name: 'CS280', label: 'L1 Lecture', day: 'Tue', time: '16:00–17:00', room: 'IONTH' },
    { name: 'CS230', label: 'L2 Lecture', day: 'Tue', time: '17:00–18:00', room: 'TH1' },
    { name: 'CS240', label: 'Labs',       day: 'Wed', time: '13:00–15:00', room: '' },
    { name: 'CS280', label: 'Labs (opt)', day: 'Wed', time: '15:00–16:00', room: '' },
    { name: 'CS335', label: 'Labs',       day: 'Wed', time: '16:00–18:00', room: '' },
    { name: 'CS240', label: 'L1 Lecture', day: 'Thu', time: '11:00–12:00', room: 'JHL1' },
    { name: 'CS240', label: 'L2 Lecture', day: 'Thu', time: '14:00–15:00', room: 'IONTH' },
    { name: 'CS355', label: 'L1 Lecture', day: 'Fri', time: '09:00–10:00', room: 'TH1' },
    { name: 'CS355', label: 'L2 Lecture', day: 'Fri', time: '10:00–11:00', room: 'TH1' },
  ],
  studySuggestions: ['CS280 peer feedback — due Fri Mar 13 (urgent)', 'CS355 Regular Expressions & Pumping Lemma', 'CS211 AVL deletions — drill all 4 cases'],
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

// Week of Mar 9–15, 2026 — counts reflect real timetable classes + deadlines
export const calendarWeekEvents = [
  { day: 'Mon', date: 9,  events: 4 }, // CS211 L1+L2, CS335 L1+L2
  { day: 'Tue', date: 10, events: 4 }, // CS211 Labs, CS230 Labs+L1, CS280 L1
  { day: 'Wed', date: 11, events: 3 }, // CS240 Labs, CS280 Labs, CS335 Labs
  { day: 'Thu', date: 12, events: 2 }, // CS240 L1+L2
  { day: 'Fri', date: 13, events: 3 }, // CS355 L1+L2 + CS280 peer feedback deadline
  { day: 'Sat', date: 14, events: 0 },
  { day: 'Sun', date: 15, events: 0 },
];

// Real subscriptions: Claude $20, Obsidian Sync $3, Car Insurance $92, Phone $20 + fuel ~$347/mo
export const financeSnapshot = {
  monthlySpending: 482,
  monthlyIncome: null, // pulled from work shifts in Supabase
  upcomingBills: [
    { name: 'Phone bill', amount: 20, due: 'Mar 17' },
    { name: 'Car Insurance', amount: 92, due: 'Mar 22' },
  ],
};

// Week of Mar 9 — real priorities from vault
export const aiPlannerSuggestions = {
  dailySchedule: [
    '09:00 – CS211 L1 Lecture (JHL1)',
    '10:30 – Focus block: CS280 peer feedback prep',
    '12:00 – CS335 L1 Lecture (ARTSALT)',
    '14:00 – CS211 L2 Lecture (JHL1)',
    '17:00 – CS335 L2 Lecture (TSILT3)',
  ],
  studyRec: 'CS280 peer feedback due Fri Mar 13 — review two assigned submissions. CS230 Lab 2 implementation not yet started.',
  focusBlocks: 'Priority: CS280 peer feedback → CS335 Week 3 note (Agile) → CS240 Lectures 5–6 notes',
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

// Seed modules from calendar (2026 semester)
export const defaultModules = [
  { name: 'CS211', credits: 5, exam_weight: 60, color: 'indigo' },
  { name: 'CS230', credits: 5, exam_weight: 60, color: 'violet' },
  { name: 'CS240', credits: 5, exam_weight: 60, color: 'blue' },
  { name: 'CS280', credits: 5, exam_weight: 60, color: 'emerald' },
  { name: 'CS335', credits: 5, exam_weight: 60, color: 'amber' },
  { name: 'CS355', credits: 5, exam_weight: 60, color: 'indigo' },
]

// School quick links
export const schoolLinks = [
  { label: 'Moodle', url: 'https://moodle.maynoothuniversity.ie/my/courses.php', accent: 'amber' },
  { label: 'Timeline', url: 'https://moodle.maynoothuniversity.ie/my/', accent: 'violet' },
  { label: 'Library', url: 'https://www.maynoothuniversity.ie/library', accent: 'blue' },
  { label: 'Student Web', url: 'https://studentweb.maynoothuniversity.ie/pls/prodi41/w99pkg.mi_startupAD', accent: 'indigo' },
  { label: 'MU Email', url: 'https://outlook.office.com/', accent: 'emerald' },
  { label: 'MU Life', url: 'https://www.mulife.ie/', accent: 'amber' },
]

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
