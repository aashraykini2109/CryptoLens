import SecurityDashboard from './SecurityDashboard';

export default function DashboardPage({ findings, onNewScan, onSelectNav, onSelectFinding }) {
  return (
    <SecurityDashboard
      onNewScan={onNewScan}
      onSelectNav={onSelectNav}
      onSelectFinding={onSelectFinding}
    />
  );
}
