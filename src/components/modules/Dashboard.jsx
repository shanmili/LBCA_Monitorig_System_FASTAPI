// ============================================================
// Dashboard.jsx — AI-integrated, attendance removed
// ============================================================

import React from 'react';
import OverviewSection from './dashboard/OverviewSection';
import KpiCards from './dashboard/KpiCards';
import TrendChart from './dashboard/TrendChart';
import PaceForecastChart from './dashboard/PaceForecastChart';
import AtRiskTable from './dashboard/AtRiskTable';
import ActivityFeed from './dashboard/ActivityFeed';
import useDashboardDataState from '../../hooks/useDashboardDataState';
import '../../styles/dashboard/Dashboard.css';

const Dashboard = ({ onNavigate, userRole = 'admin' }) => {
  const {
    filters,
    updateFilter,
    kpiData,
    trendData,
    trendSectionKeys,
    forecastData,
    atRiskStudents,
    activityFeed,
    sectionOptions,
    schoolYearOptions,
    loading,
    aiLoading,
    error,
    aiInsights,
  } = useDashboardDataState();

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading dashboard data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div style={{ padding: '2rem', color: '#EF4444' }}>
          ⚠ Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  const dynamicFilters = {
    ...filters,
    _sectionOptions: sectionOptions,
    _schoolYearOptions: schoolYearOptions,
  };

  return (
    <div className="dashboard">
      <OverviewSection
        title="Overview"
        subtitle={`Welcome back, ${userRole === 'teacher' ? 'Teacher' : 'Admin'}`}
        filters={dynamicFilters}
        onFilterChange={updateFilter}
      />

      <KpiCards data={kpiData} onNavigate={onNavigate} />

      {aiLoading && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          ⏳ AI analysis running…
        </div>
      )}

      <div className="charts-row">
        {/* PACE Completion Trend — real data from backend by section */}
        <TrendChart data={trendData} sectionKeys={trendSectionKeys} />

        {/* AI-powered PACE Forecast — replaces the old attendance chart */}
        <PaceForecastChart
          forecastData={forecastData}
          aiInsights={aiInsights}
          aiLoading={aiLoading}
        />
      </div>

      <div className="bottom-row">
        <AtRiskTable students={atRiskStudents} onNavigate={onNavigate} />
        <ActivityFeed activities={activityFeed} />
      </div>
    </div>
  );
};

export default Dashboard;