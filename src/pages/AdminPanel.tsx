import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Database,
  Users,
  TrendingUp,
  Activity,
  Server,
  RefreshCw,
  Zap,
  Brain,
  Clock,
  Settings
} from 'lucide-react'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function AdminPanel() {
  const { user } = useAuth()
  const { loading, stats, getAdminStats, triggerWeeklyBatch } = useAdmin()

  useEffect(() => {
    getAdminStats()
  }, [])

  // Auth kontrolü kaldırıldı - demo için herkes erişebilir
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <p className="text-foreground">Lütfen giriş yapın</p>
  //     </div>
  //   )
  // }

  const subscriptionData = stats ? [
    { name: 'Ücretsiz', value: stats.users.subscriptions.free, color: COLORS[0] },
    { name: 'Basic', value: stats.users.subscriptions.basic, color: COLORS[1] },
    { name: 'Pro', value: stats.users.subscriptions.pro, color: COLORS[2] },
    { name: 'Premium', value: stats.users.subscriptions.premium, color: COLORS[3] }
  ] : []

  const usageData = stats ? [
    { name: 'Ücretsiz', requests: stats.usage.today.planBreakdown.free },
    { name: 'Basic', requests: stats.usage.today.planBreakdown.basic },
    { name: 'Pro', requests: stats.usage.today.planBreakdown.pro },
    { name: 'Premium', requests: stats.usage.today.planBreakdown.premium }
  ] : []

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">ScoreResultsAI sistem yönetimi</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              onClick={() => getAdminStats()} 
              variant="outline" 
              disabled={loading}
              size="sm"
              className="border-border text-foreground hover:bg-muted text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Yenile</span>
              <span className="sm:hidden">Yenile</span>
            </Button>
            <Button 
              onClick={triggerWeeklyBatch} 
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">Batch Çalıştır</span>
              <span className="sm:hidden">Batch</span>
            </Button>
            <Link to="/admin/llm">
              <Button variant="secondary" size="sm" className="bg-slate-700 hover:bg-slate-600 text-xs sm:text-sm">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">LLM Yönetimi</span>
                <span className="sm:hidden">LLM</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Tahmin</CardTitle>
              <Database className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.predictions.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Son 24 saat: {stats?.predictions.last24h || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Cache</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.predictions.activeCache || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Hit Rate: %{stats?.usage.cacheHitRate || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.users.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Bugünkü ortalama: {stats?.usage.today.averagePerUser || 0} tahmin
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü İstek</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.usage.today.totalRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Sistem durumu: Aktif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Subscription Distribution */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-foreground">Abonelik Dağılımı</CardTitle>
              <CardDescription>Kullanıcı planına göre dağılım</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Usage by Plan */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-foreground">Bugünkü Kullanım</CardTitle>
              <CardDescription>Plan türüne göre istek sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="requests" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LLM Providers */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Server className="h-5 w-5" />
                LLM Provider Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.system.providers.map((provider, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-700">
                    <div>
                      <p className="font-medium text-foreground">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">Priorite: {provider.priority}</p>
                    </div>
                    <Badge 
                      variant={provider.status === 'active' ? 'default' : 'destructive'}
                      className={provider.status === 'active' ? 'bg-green-600' : 'bg-red-600'}
                    >
                      {provider.status === 'active' ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sistem Bilgisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sistem Çalışma Süresi</span>
                  <span className="text-foreground font-medium">{stats?.system.uptime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Son Batch Çalışma</span>
                  <span className="text-foreground font-medium">
                    {stats?.system.lastBatchRun 
                      ? new Date(stats.system.lastBatchRun).toLocaleString('tr-TR')
                      : 'Bilinmiyor'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cache Hit Oranı</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={stats?.usage.cacheHitRate || 0} 
                      className="w-20 h-2" 
                    />
                    <span className="text-foreground font-medium">%{stats?.usage.cacheHitRate || 0}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Güncelleme Zamanı</span>
                  <span className="text-foreground font-medium">
                    {stats?.timestamp 
                      ? new Date(stats.timestamp).toLocaleString('tr-TR')
                      : 'Bilinmiyor'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}