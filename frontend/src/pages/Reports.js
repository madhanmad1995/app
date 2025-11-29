import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Reports = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/attendance/monthly/${selectedYear}/${selectedMonth}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const totalWages = report.reduce((sum, worker) => sum + worker.total_wages, 0);
  const totalHours = report.reduce((sum, worker) => sum + worker.total_hours, 0);

  const handleExport = () => {
    const monthName = months.find((m) => m.value === selectedMonth)?.label;
    const csvContent = [
      ['Worker Name', 'Worker ID', 'Daily Wage Rate', 'Present Days', 'Total Hours', 'Total Wages'],
      ...report.map((w) => [
        w.worker_name,
        w.worker_number,
        `₹${w.daily_wage_rate.toFixed(2)}`,
        w.present_days,
        w.total_hours.toFixed(2),
        `₹${w.total_wages.toFixed(2)}`,
      ]),
      [],
      ['', '', '', '', 'Total:', `₹${totalWages.toFixed(2)}`],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wage_report_${monthName}_${selectedYear}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="heading-font text-4xl font-black text-zinc-900 mb-2">REPORTS</h1>
        <p className="body-font text-zinc-600">Monthly wage and attendance summaries</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-3">
            <div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger data-testid="select-month" className="w-36 rounded-sm border-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger data-testid="select-year" className="w-28 rounded-sm border-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            data-testid="export-report-button"
            onClick={handleExport}
            disabled={report.length === 0}
            className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-sm industrial-shadow btn-industrial uppercase tracking-wide"
          >
            <Download size={20} className="mr-2" />
            Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-100 rounded"></div>
            ))}
          </div>
        ) : report.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="body-font text-zinc-500">No data available for selected period</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-zinc-900">
                    <th className="body-font text-left py-3 px-4 font-bold uppercase tracking-wide text-sm">Worker Name</th>
                    <th className="body-font text-left py-3 px-4 font-bold uppercase tracking-wide text-sm">Worker ID</th>
                    <th className="body-font text-left py-3 px-4 font-bold uppercase tracking-wide text-sm">Daily Wage</th>
                    <th className="body-font text-center py-3 px-4 font-bold uppercase tracking-wide text-sm">Present Days</th>
                    <th className="body-font text-right py-3 px-4 font-bold uppercase tracking-wide text-sm">Total Hours</th>
                    <th className="body-font text-right py-3 px-4 font-bold uppercase tracking-wide text-sm">Total Wages</th>
                  </tr>
                </thead>
                <tbody className="table-zebra">
                  {report.map((worker, index) => (
                    <tr key={index} className="border-b border-zinc-200" data-testid="report-row">
                      <td className="body-font py-4 px-4">{worker.worker_name}</td>
                      <td className="body-font py-4 px-4 mono-font">{worker.worker_number}</td>
                      <td className="body-font py-4 px-4 mono-font">₹{worker.daily_wage_rate.toFixed(2)}</td>
                      <td className="body-font py-4 px-4 text-center mono-font">{worker.present_days}</td>
                      <td className="body-font py-4 px-4 text-right mono-font">{worker.total_hours.toFixed(2)}h</td>
                      <td className="body-font py-4 px-4 text-right mono-font font-bold">₹{worker.total_wages.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-900 bg-zinc-50">
                    <td colSpan="4" className="body-font py-4 px-4 font-bold uppercase tracking-wide">Total</td>
                    <td className="body-font py-4 px-4 text-right mono-font font-bold">{totalHours.toFixed(2)}h</td>
                    <td className="body-font py-4 px-4 text-right mono-font font-bold text-lg">₹{totalWages.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;