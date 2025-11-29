import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Attendance = () => {
  const [workers, setWorkers] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, attendanceRes] = await Promise.all([
        axios.get(`${API}/workers`),
        axios.get(`${API}/attendance/today`),
      ]);
      setWorkers(workersRes.data);
      setTodayAttendance(attendanceRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedWorker) {
      toast.error('Please select a worker');
      return;
    }
    if (!clockInTime || !clockOutTime) {
      toast.error('Please provide both clock-in and clock-out times');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const clockInISO = new Date(`${today}T${clockInTime}`).toISOString();
      const clockOutISO = new Date(`${today}T${clockOutTime}`).toISOString();

      await axios.post(`${API}/attendance`, {
        worker_id: selectedWorker,
        clock_in: clockInISO,
        clock_out: clockOutISO,
      });

      toast.success('Attendance marked successfully');
      setSelectedWorker('');
      setClockInTime('');
      setClockOutTime('');
      fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.detail || 'Failed to mark attendance');
    }
  };

  const getAttendanceStatus = (workerId) => {
    return todayAttendance.find((att) => att.worker_id === workerId);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
          <div className="h-64 bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="heading-font text-4xl font-black text-zinc-900 mb-2">ATTENDANCE</h1>
        <p className="body-font text-zinc-600">Mark daily attendance with clock-in/out times</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mark Attendance Form */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <h2 className="heading-font text-xl font-bold text-zinc-900 mb-6 uppercase">Mark Attendance</h2>
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <Label htmlFor="worker" className="body-font text-sm font-medium uppercase tracking-wide">
                Select Worker
              </Label>
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger data-testid="select-worker" className="mt-1 rounded-sm border-zinc-300">
                  <SelectValue placeholder="Choose a worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} ({worker.worker_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clockIn" className="body-font text-sm font-medium uppercase tracking-wide">
                Clock In Time
              </Label>
              <Input
                data-testid="clock-in-time"
                id="clockIn"
                type="time"
                required
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                className="mt-1 rounded-sm border-zinc-300 mono-font"
              />
            </div>
            <div>
              <Label htmlFor="clockOut" className="body-font text-sm font-medium uppercase tracking-wide">
                Clock Out Time
              </Label>
              <Input
                data-testid="clock-out-time"
                id="clockOut"
                type="time"
                required
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                className="mt-1 rounded-sm border-zinc-300 mono-font"
              />
            </div>
            <Button
              data-testid="mark-attendance-button"
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-sm industrial-shadow btn-industrial uppercase tracking-wide"
            >
              <Clock size={20} className="mr-2" />
              Mark Attendance
            </Button>
          </form>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6">
          <h2 className="heading-font text-xl font-bold text-zinc-900 mb-6 uppercase">Today's Status</h2>
          {workers.length === 0 ? (
            <p className="body-font text-zinc-500 text-center py-8">No workers available</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workers.map((worker) => {
                const attendance = getAttendanceStatus(worker.id);
                return (
                  <div
                    key={worker.id}
                    data-testid="attendance-status-row"
                    className="flex items-center justify-between p-3 border border-zinc-200 rounded-sm"
                  >
                    <div>
                      <p className="body-font font-medium">{worker.name}</p>
                      <p className="body-font text-xs text-zinc-500 mono-font">{worker.worker_id}</p>
                    </div>
                    {attendance ? (
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 size={18} />
                          <span className="body-font font-semibold uppercase text-sm">Present</span>
                        </div>
                        <p className="body-font text-xs text-zinc-600 mono-font mt-1">
                          {attendance.hours_worked.toFixed(2)}h • ₹{attendance.wage_earned.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <span className="body-font text-sm text-zinc-400 uppercase">Not marked</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;