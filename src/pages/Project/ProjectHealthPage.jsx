import { useState } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Activity,
  Shield,
  Code2,
  Users,
  Zap,
  FileText,
  TestTube,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  GitBranch,
  Sparkles,
  TrendingUp,
  Clock,
  ListTodo,
} from 'lucide-react'

const healthData = {
  overall: 72,
  categories: [
    { name: 'Code Quality', score: 75, icon: Code2, color: '#22c55e' },
    { name: 'Dev Experience', score: 68, icon: Users, color: '#eab308' },
    { name: 'User Experience', score: 70, icon: Activity, color: '#22c55e' },
    { name: 'Security', score: 85, icon: Shield, color: '#22c55e' },
    { name: 'Performance', score: 78, icon: Zap, color: '#22c55e' },
    { name: 'Documentation', score: 25, icon: FileText, color: '#ef4444' },
    { name: 'Testing', score: 15, icon: TestTube, color: '#ef4444' },
  ],
  radarData: [
    { category: 'Code Quality', value: 75, fullMark: 100 },
    { category: 'Dev Experience', value: 68, fullMark: 100 },
    { category: 'User Experience', value: 70, fullMark: 100 },
    { category: 'Security', value: 85, fullMark: 100 },
    { category: 'Performance', value: 78, fullMark: 100 },
    { category: 'Documentation', value: 25, fullMark: 100 },
    { category: 'Testing', value: 15, fullMark: 100 },
  ],
  weeklyData: [
    { day: 'Mon', score: 65 },
    { day: 'Tue', score: 68 },
    { day: 'Wed', score: 70 },
    { day: 'Thu', score: 71 },
    { day: 'Fri', score: 72 },
    { day: 'Sat', score: 72 },
    { day: 'Sun', score: 72 },
  ],
}

const criticalIssues = [
  {
    id: 1,
    title: 'No Test Suite Configured',
    description: 'Add Vitest for frontend and Jest for backend testing',
    priority: 'critical',
    effort: '1 week',
    impact: 'High',
    category: 'Testing',
  },
  {
    id: 2,
    title: 'Missing Documentation',
    description: 'Create README.md, CONTRIBUTING.md, and API docs',
    priority: 'critical',
    effort: '2 days',
    impact: 'Medium',
    category: 'Documentation',
  },
  {
    id: 3,
    title: 'No ESLint/Prettier Config',
    description: 'Add code quality tooling to enforce consistency',
    priority: 'high',
    effort: '1 day',
    impact: 'Medium',
    category: 'Code Quality',
  },
]

const recommendations = [
  {
    id: 1,
    title: 'Add Undo/Redo to ERD Canvas',
    description: 'Will increase productivity by 30% for ERD editing',
    category: 'UX',
    priority: 'high',
    estimatedTime: '3 days',
  },
  {
    id: 2,
    title: 'Implement Dark/Light Theme Toggle',
    description: 'Users have been requesting theme options',
    category: 'UX',
    priority: 'medium',
    estimatedTime: '2 days',
  },
  {
    id: 3,
    title: 'Add Keyboard Shortcuts',
    description: 'Power users expect keyboard shortcuts for common actions',
    category: 'UX',
    priority: 'high',
    estimatedTime: '2 days',
  },
  {
    id: 4,
    title: 'Set Up CI/CD Pipeline',
    description: 'Automate testing and deployment with GitHub Actions',
    category: 'DevOps',
    priority: 'medium',
    estimatedTime: '2 days',
  },
  {
    id: 5,
    title: 'Add TypeScript Gradually',
    description: 'Start with type definitions for API responses',
    category: 'Code Quality',
    priority: 'medium',
    estimatedTime: '2 weeks',
  },
]

const quickActions = [
  {
    id: 1,
    title: 'Run Prettier',
    description: 'Format all code files',
    icon: Code2,
    command: 'npx prettier --write .',
    time: '30 sec',
  },
  {
    id: 2,
    title: 'Add ESLint Config',
    description: 'Copy ESLint configuration',
    icon: Shield,
    command: 'npm install -D eslint prettier',
    time: '2 min',
  },
  {
    id: 3,
    title: 'Setup Tests',
    description: 'Initialize Vitest for frontend',
    icon: TestTube,
    command: 'npm install -D vitest',
    time: '5 min',
  },
  {
    id: 4,
    title: 'Create README',
    description: 'Generate project documentation',
    icon: BookOpen,
    command: 'touch README.md',
    time: '10 min',
  },
]

function HealthScoreCard({ score }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }

  return (
    <div className={`rounded-xl border p-6 ${getScoreBg(score)}`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg className="w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-zinc-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={`${score * 3.52} 352`}
              strokeLinecap="round"
              className={getScoreColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Project Health</h3>
          <p className="text-zinc-400">Overall Score</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+7 points this week</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ category, score }) {
  const Icon = category.icon
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: category.color }} />
        </div>
        <span className="font-medium text-white">{category.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getScoreColor(score)} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-sm font-mono text-zinc-400">{score}</span>
      </div>
    </div>
  )
}

function RadarChartCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Health Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={healthData.radarData}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
          />
          <Radar
            name="Health Score"
            dataKey="value"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function WeeklyTrendCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Weekly Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={healthData.weeklyData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            domain={[60, 80]}
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function CriticalIssuesCard({ issues }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Critical Issues
        </h3>
        <span className="text-sm text-zinc-400">{issues.length} found</span>
      </div>
      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-white">{issue.title}</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  {issue.description}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  issue.priority === 'critical'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {issue.priority}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {issue.effort}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {issue.impact} Impact
              </span>
              <span className="flex items-center gap-1">
                <ListTodo className="w-3 h-3" />
                {issue.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickActionsCard({ actions }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        Quick Actions
      </h3>
      <div className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-zinc-500">{action.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-mono bg-zinc-900 px-2 py-1 rounded">
                  {action.time}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RecommendationsCard({ recommendations }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-purple-400" />
        AI Recommendations
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id}
            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
          >
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{rec.title}</h4>
                  <span className="text-xs text-zinc-500">{rec.estimatedTime}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{rec.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-700 text-xs text-zinc-300">
                    {rec.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      rec.priority === 'high'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {rec.priority} priority
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm">
        View All Recommendations
      </button>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        status === 'Good'
          ? 'bg-green-500/20 text-green-400'
          : status === 'Needs Improvement'
          ? 'bg-yellow-500/20 text-yellow-400'
          : 'bg-red-500/20 text-red-400'
      }`}
    >
      {status}
    </span>
  )
}

export default function ProjectHealthPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Activity className="w-7 h-7 text-cyan-400" />
              Project Health Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">
              DBForge - ERD & API Documentation Platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="Good" />
            <button className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-medium transition-colors">
              Export Report
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          {['overview', 'code', 'ux', 'devops', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <HealthScoreCard score={healthData.overall} />
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {healthData.categories.slice(0, 4).map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                score={category.score}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RadarChartCard />
          <WeeklyTrendCard />
          <QuickActionsCard actions={quickActions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CriticalIssuesCard issues={criticalIssues} />
          <RecommendationsCard recommendations={recommendations} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Score Breakdown by Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthData.categories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.name}
                  className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/30"
                >
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: category.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{category.name}</p>
                    <p className="text-sm text-zinc-400">
                      Score: {category.score}/100
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center text-sm text-zinc-500 py-4">
          Last scanned: April 5, 2026 at 10:30 AM | Next scan in 24 hours
        </div>
      </div>
    </div>
  )
}
